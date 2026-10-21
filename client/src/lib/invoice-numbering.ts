import { createHash } from 'crypto'
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

export const issueInvoiceNumber = async ({ customerId, startDate, endDate, orderIds }: InvoiceToNumber) => {
  await ensureTable()
  const ids = [...new Set(orderIds)].sort((a, b) => a - b)
  const orderKey = createHash('sha256').update(`${customerId}:${ids.join(',')}`).digest('hex')

  const invoiceNo = await prisma.$transaction(async tx => {
    const existing = await tx.$queryRaw<Array<{ invoiceno: number }>>`
      SELECT invoiceno FROM customer_invoice_numbers WHERE orderkey = ${orderKey}
    `
    if (existing.length) return Number(existing[0].invoiceno)

    // One allocation at a time, so two people printing at once never share a number.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${INVOICE_NUMBER_LOCK})`
    const again = await tx.$queryRaw<Array<{ invoiceno: number }>>`
      SELECT invoiceno FROM customer_invoice_numbers WHERE orderkey = ${orderKey}
    `
    if (again.length) return Number(again[0].invoiceno)

    const [{ next }] = await tx.$queryRaw<Array<{ next: number }>>`
      SELECT (GREATEST(
        COALESCE((SELECT MAX(invoiceno) FROM orders), 0),
        COALESCE((SELECT MAX(invoiceno) FROM customer_invoice_numbers), 0)
      ) + 1)::int AS "next"
    `
    await tx.$executeRaw`
      INSERT INTO customer_invoice_numbers (invoiceno, customerid, startdate, enddate, orderkey, orderids)
      VALUES (${next}, ${customerId}, ${startDate}::date, ${endDate}::date, ${orderKey}, ${ids}::int[])
    `

    return Number(next)
  })

  return formatInvoiceNumber(invoiceNo)
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

  const numbers: Record<string, string> = {}
  for (const [customerId, orderIds] of byCustomer) {
    numbers[String(customerId)] = await issueInvoiceNumber({ customerId, startDate, endDate, orderIds })
  }

  return numbers
}
