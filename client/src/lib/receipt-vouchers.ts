import { Prisma } from '@prisma/client'

// The desktop RMS posts a Received Voucher for every order marked "Payment
// Received": debit CASH, credit the customer's account, for the order amount,
// described "Received Payment From Customer <name> Against Order # <orderno>".
// Without it the cash book (Account Reports on CASH) never shows the money that
// came in. These helpers do the same for the web Payment Received buttons.

export const CASH_ACCOUNT_CODE = '10001'
export const RECEIVED_VOUCHER_TYPE = 2

// Same key as the voucher create API, so receipts and manual vouchers never
// take the same voucher number.
const VOUCHER_NUMBER_LOCK = 918273647

// Reads the order number back out of a receipt description. split_part is
// several times faster than a regex over the ~340k imported receipts.
const ORDER_MARKER = 'Against Order # '

type Tx = Prisma.TransactionClient

/** The desktop joins first, middle and last name with single spaces, keeping
 *  the gap of a blank middle name ("SpringField  School"). */
export const receiptDescription = (
  customer: { firstname?: string | null; middlename?: string | null; lastname?: string | null },
  orderno: string
) =>
  `Received Payment From Customer ${customer.firstname ?? ''} ${customer.middlename ?? ''} ${
    customer.lastname ?? ''
  } ${ORDER_MARKER}${orderno}`

/** Today's calendar day in Pakistan, as midnight (how voucher dates are stored). */
export const todayInPakistan = (now: Date = new Date()) => {
  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)

  return new Date(`${day}T00:00:00.000Z`)
}

/**
 * Brings the receipt vouchers in line with the paid flag of the given orders:
 * a paid order without a receipt gets one dated today, and an order marked not
 * paid loses its receipt (soft delete, like every other voucher delete).
 * Orders that already have a receipt are left alone, so pressing Payment
 * Received twice never posts the cash twice.
 */
export async function syncReceiptVouchers(tx: Tx, orderIds: number[], received: boolean) {
  if (!orderIds.length) return { posted: 0, removed: 0 }

  const orders = await tx.$queryRaw<
    {
      orderno: string
      orderamount: number
      accountno: string | null
      firstname: string | null
      middlename: string | null
      lastname: string | null
    }[]
  >`
    SELECT o.orderno, COALESCE(o.orderamount, 0)::int AS orderamount, c.accountno,
           c.firstname, c.middlename, c.lastname
    FROM orders o
    LEFT JOIN customer c ON c.customerid = o.customerid
    WHERE o.orderid IN (${Prisma.join(orderIds)})
      AND COALESCE(o.ispaymentreceived, false) = ${received}
      AND o.orderno IS NOT NULL
    ORDER BY o.customerid, o.invoicedate, o.orderid
  `
  if (!orders.length) return { posted: 0, removed: 0 }

  const ordernos = [...new Set(orders.map(o => o.orderno))]

  if (!received) {
    const removed = await tx.$executeRaw`
      UPDATE vouchers
      SET isdeleted = true, modifydate = NOW()
      WHERE vouchertype = ${RECEIVED_VOUCHER_TYPE}
        AND COALESCE(isdeleted, false) = false
        AND split_part(description, ${ORDER_MARKER}, 2) = ANY(${ordernos})
    `

    return { posted: 0, removed }
  }

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${VOUCHER_NUMBER_LOCK})`

  const existing = await tx.$queryRaw<{ orderno: string }[]>`
    SELECT DISTINCT split_part(description, ${ORDER_MARKER}, 2) AS orderno
    FROM vouchers
    WHERE vouchertype = ${RECEIVED_VOUCHER_TYPE}
      AND COALESCE(isdeleted, false) = false
      AND split_part(description, ${ORDER_MARKER}, 2) = ANY(${ordernos})
  `
  const alreadyPosted = new Set(existing.map(row => row.orderno))
  const seen = new Set<string>()
  const toPost = orders.filter(order => {
    if (alreadyPosted.has(order.orderno) || seen.has(order.orderno)) return false
    seen.add(order.orderno)

    // Nothing to post for a free order, and no account to credit without one.
    return order.orderamount > 0 && Boolean(order.accountno)
  })
  if (!toPost.length) return { posted: 0, removed: 0 }

  const max = await tx.vouchers.aggregate({ _max: { voucherno: true } })
  const first = (max._max.voucherno ?? 0) + 1
  const voucherdate = todayInPakistan()
  const modifydate = new Date()

  await tx.vouchers.createMany({
    data: toPost.map((order, index) => ({
      voucherno: first + index,
      vouchertype: RECEIVED_VOUCHER_TYPE,
      voucherdate,
      description: receiptDescription(order, order.orderno),
      voucheramount: order.orderamount,
      isdeleted: false,
      modifydate
    }))
  })
  await tx.voucher_trans.createMany({
    data: toPost.flatMap((order, index) => [
      {
        voucherno: first + index,
        accountcode: CASH_ACCOUNT_CODE,
        chqno: null,
        debitamount: order.orderamount,
        creditamount: 0
      },
      {
        voucherno: first + index,
        accountcode: order.accountno as string,
        chqno: null,
        debitamount: 0,
        creditamount: order.orderamount
      }
    ])
  })

  return { posted: toPost.length, removed: 0 }
}
