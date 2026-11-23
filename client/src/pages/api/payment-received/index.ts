import type { NextApiRequest, NextApiResponse } from 'next/types'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'
import { syncReceiptVouchers } from 'src/lib/receipt-vouchers'

// Records that customers paid (or, to undo a mistake, did not pay) for every
// order invoiced inside a date range. This is the web version of the desktop
// "Payment Received" task: once a period is marked paid, the customer drops off
// the print-invoice list for that period and out of accounts receivable.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { customerIds, orderIds, startDate, endDate, received } = req.body ?? {}

  if (typeof received !== 'boolean') {
    return res.status(400).json({ error: 'received must be true or false' })
  }

  // The orders ticked on the Orders screen, as in the desktop RMS: pick a month,
  // search the customer, select all, Payment Received.
  if (orderIds !== undefined) {
    const orders = Array.isArray(orderIds) ? [...new Set(orderIds.map(id => Number(id)))] : []
    if (!orders.length || orders.some(id => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({ error: 'Select at least one order' })
    }

    try {
      const result = await prisma.$transaction(
        async tx => {
          const rows = await tx.$queryRaw<{ orderid: number }[]>`
            UPDATE orders
            SET ispaymentreceived = ${received}, modifydate = NOW()
            WHERE orderid IN (${Prisma.join(orders)})
              AND COALESCE(isdeleted, false) = false
              AND COALESCE(orderstatus, '') NOT IN ('Cancel', 'Canceled')
            RETURNING orderid
          `
          const vouchers = await syncReceiptVouchers(tx, rows.map(row => row.orderid), received)

          return { updated: rows.length, ...vouchers }
        },
        { timeout: 30000 }
      )

      return res.status(200).json(result)
    } catch (error) {
      console.error('Failed to record payment received:', error)

      return res.status(500).json({ error: 'Failed to record payment' })
    }
  }

  const parseCalendarDate = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    const date = new Date(`${value}T00:00:00Z`)

    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
  }

  const ids = Array.isArray(customerIds) ? [...new Set(customerIds.map(id => Number(id)))] : []
  const rangeStart = parseCalendarDate(startDate)
  const rangeEnd = parseCalendarDate(endDate)

  if (!ids.length || ids.some(id => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({ error: 'Select at least one customer' })
  }

  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return res
      .status(400)
      .json({ error: 'Start and end dates must be valid calendar dates, with start on or before end' })
  }

  try {
    // Same order selection as the invoice itself, so exactly the orders that
    // appear on the printed invoice are the ones marked paid.
    const result = await prisma.$transaction(
      async tx => {
        const rows = await tx.$queryRaw<{ orderid: number }[]>`
          UPDATE orders
          SET ispaymentreceived = ${received}, modifydate = NOW()
          WHERE customerid IN (${Prisma.join(ids)})
            AND invoicedate >= ${rangeStart}::date
            AND invoicedate < (${rangeEnd}::date + INTERVAL '1 day')
            AND COALESCE(isdeleted, false) = false
            AND COALESCE(orderstatus, '') NOT IN ('Cancel', 'Canceled')
          RETURNING orderid
        `
        // The cash comes in as Received Vouchers, as in the desktop RMS.
        const vouchers = await syncReceiptVouchers(tx, rows.map(row => row.orderid), received)

        return { updated: rows.length, ...vouchers }
      },
      { timeout: 30000 }
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('Failed to record payment received:', error)

    return res.status(500).json({ error: 'Failed to record payment' })
  }
}
