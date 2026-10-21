import { createHash } from 'crypto'
import prisma from 'src/lib/prisma'

// Short running invoice numbers (INV-1001, INV-1002, ...), like the desktop RMS
// "RI-349270" numbers but with our own prefix so the two systems never clash.
//
// An invoice is a printout of a customer's UNPAID orders in a period (paid
// orders never appear on an invoice). The number belongs to that exact set of
// orders: reprinting the same unpaid orders shows the same number, and once the
// set changes (an order was paid, or a new one delivered) it gets a new number.
const FIRST_NUMBER_OFFSET = 1000

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

export const formatInvoiceNumber = (id: number) => `INV-${FIRST_NUMBER_OFFSET + id}`

export type InvoiceToNumber = { customerId: number; startDate: string; endDate: string; orderIds: number[] }

export const issueInvoiceNumber = async ({ customerId, startDate, endDate, orderIds }: InvoiceToNumber) => {
  await ensureTable()
  const ids = [...new Set(orderIds)].sort((a, b) => a - b)
  const orderKey = createHash('sha256').update(`${customerId}:${ids.join(',')}`).digest('hex')

  // Insert-or-reuse in one statement, safe when two people print at once.
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    WITH inserted AS (
      INSERT INTO customer_invoice_numbers (customerid, startdate, enddate, orderkey, orderids)
      VALUES (${customerId}, ${startDate}::date, ${endDate}::date, ${orderKey}, ${ids}::int[])
      ON CONFLICT (orderkey) DO NOTHING
      RETURNING id
    )
    SELECT id FROM inserted
    UNION ALL
    SELECT id FROM customer_invoice_numbers WHERE orderkey = ${orderKey}
    LIMIT 1
  `

  return formatInvoiceNumber(Number(rows[0].id))
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
