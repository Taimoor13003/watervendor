import { createHash } from 'crypto'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'

// Invoice numbers continue the desktop RMS series: RI-345693, RI-345694, ...
// The imported RMS data keeps its invoice numbers in orders.invoiceno, so each
// new number is one past the highest number used so far, there or here.
//
// An invoice is a printout of a customer's UNPAID orders in a period (paid
// orders never appear on an invoice). The number belongs to that exact set of
// orders: reprinting the same unpaid orders shows the same number, and once the
// set changes (an order was paid, or a new one delivered) it gets a new number.
const INVOICE_PREFIX = 'RI-'
// Arbitrary but fixed key: serialises number allocation across requests.
const INVOICE_NUMBER_LOCK = 918273646

let tableReady: Promise<unknown> | null = null

// Created on first use so no deployment needs a manual migration. The same
// table is declared in prisma/schema.prisma (customer_invoice_numbers) so
// `prisma db push` keeps it.
const ensureTable = () => {
  if (!tableReady) {
    tableReady = prisma
      .$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS customer_invoice_numbers (
          id SERIAL PRIMARY KEY,
          invoiceno INTEGER NOT NULL UNIQUE,
          customerid INTEGER NOT NULL,
          startdate DATE,
          enddate DATE,
          orderkey VARCHAR(64) NOT NULL UNIQUE,
          orderids INTEGER[] NOT NULL,
          createdat TIMESTAMP(6) DEFAULT NOW()
        )`
      )
      .catch(error => {
        tableReady = null
        throw error
      })
  }

  return tableReady
}

export const formatInvoiceNumber = (invoiceNo: number) => `${INVOICE_PREFIX}${invoiceNo}`

export type InvoiceToNumber = { customerId: number; startDate: string; endDate: string; orderIds: number[] }

const orderKeyFor = (customerId: number, orderIds: number[]) =>
  createHash('sha256').update(`${customerId}:${orderIds.join(',')}`).digest('hex')

// Numbers several invoices in one transaction. Printing many customers at once
// used to open one transaction per customer, each scanning orders for the
// highest RMS number; a batch of three ran past the request time limit and the
// whole invoice screen failed. Now a batch costs the same few queries as one.
const issueNumbers = async (invoices: InvoiceToNumber[], startDate: string, endDate: string) => {
  await ensureTable()

  const wanted = new Map<string, { customerId: number; orderIds: number[] }>()
  const keyByCustomer = new Map<number, string>()
  invoices.forEach(({ customerId, orderIds }) => {
    const ids = [...new Set(orderIds)].sort((a, b) => a - b)
    const orderKey = orderKeyFor(customerId, ids)
    wanted.set(orderKey, { customerId, orderIds: ids })
    keyByCustomer.set(customerId, orderKey)
  })
  if (!wanted.size) return {}

  const findExisting = async (db: Pick<typeof prisma, '$queryRaw'>, keys: string[]) => {
    const rows = await db.$queryRaw<Array<{ orderkey: string; invoiceno: number }>>`
      SELECT orderkey, invoiceno FROM customer_invoice_numbers WHERE orderkey = ANY(${keys}::varchar[])
    `

    return new Map(rows.map(row => [row.orderkey, Number(row.invoiceno)]))
  }

  let numbers = await findExisting(prisma, [...wanted.keys()])
  const missing = [...wanted.keys()].filter(key => !numbers.has(key))

  if (missing.length) {
    // RMS numbers only change when its data is imported, so this slow scan of
    // orders stays outside the lock.
    const [{ rmsmax }] = await prisma.$queryRaw<Array<{ rmsmax: number }>>`
      SELECT COALESCE(MAX(invoiceno), 0)::int AS "rmsmax" FROM orders
    `

    numbers = await prisma.$transaction(
      async tx => {
        // One allocation at a time, so two people printing at once never share a number.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${INVOICE_NUMBER_LOCK})`
        const issued = await findExisting(tx, [...wanted.keys()])
        const toInsert = [...wanted.keys()].filter(key => !issued.has(key))
        if (!toInsert.length) return issued

        const [{ webmax }] = await tx.$queryRaw<Array<{ webmax: number }>>`
          SELECT COALESCE(MAX(invoiceno), 0)::int AS "webmax" FROM customer_invoice_numbers
        `
        let next = Math.max(Number(rmsmax), Number(webmax))
        const values = toInsert.map(key => {
          next += 1
          issued.set(key, next)
          const { customerId, orderIds } = wanted.get(key)!

          return Prisma.sql`(${next}, ${customerId}, ${startDate}::date, ${endDate}::date, ${key}, ${orderIds}::int[])`
        })
        await tx.$executeRaw`
          INSERT INTO customer_invoice_numbers (invoiceno, customerid, startdate, enddate, orderkey, orderids)
          VALUES ${Prisma.join(values)}
        `

        return issued
      },
      { maxWait: 10000, timeout: 20000 }
    )
  }

  const result: Record<string, string> = {}
  keyByCustomer.forEach((orderKey, customerId) => {
    result[String(customerId)] = formatInvoiceNumber(numbers.get(orderKey)!)
  })

  return result
}

export const issueInvoiceNumber = async (invoice: InvoiceToNumber) => {
  const numbers = await issueNumbers([invoice], invoice.startDate, invoice.endDate)

  return numbers[String(invoice.customerId)]
}

/** Numbers for several customers' invoices at once, keyed by customer id. */
export const issueInvoiceNumbers = async (
  rows: Array<{ customerid: number | null; orderid: number | null }>,
  startDate: string,
  endDate: string
) => {
  const byCustomer = new Map<number, number[]>()
  rows.forEach(row => {
    if (!row.customerid || !row.orderid) return
    byCustomer.set(row.customerid, [...(byCustomer.get(row.customerid) || []), row.orderid])
  })

  return issueNumbers(
    [...byCustomer].map(([customerId, orderIds]) => ({ customerId, startDate, endDate, orderIds })),
    startDate,
    endDate
  )
}
