import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

// Returns the customers who still have an unpaid, invoiceable order inside the
// selected invoice date range. The invoice screen uses this to hide customers
// who already settled the period, so only outstanding invoices get printed.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { startDate, endDate } = req.query

  const parseCalendarDate = (value: unknown) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    const date = new Date(`${value}T00:00:00Z`)

    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
  }

  const rangeStart = parseCalendarDate(startDate)
  const rangeEnd = parseCalendarDate(endDate)

  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return res
      .status(400)
      .json({ error: 'Start and end dates must be valid calendar dates, with start on or before end' })
  }

  try {
    // An order counts as outstanding when payment has not been received. The
    // same conditions the accounts receivable report uses are applied here so
    // both screens agree on what "unpaid" means.
    const rows = await prisma.$queryRaw<Array<{ customerid: number; unpaidorders: number; unpaidamount: number }>>`
      SELECT o.customerid,
             COUNT(*)::int AS "unpaidorders",
             COALESCE(SUM(COALESCE(o.orderamount, 0)), 0)::int AS "unpaidamount"
      FROM orders o
      WHERE COALESCE(o.ispaymentreceived, false) = false
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        AND o.customerid IS NOT NULL
        AND o.invoicedate >= ${rangeStart}::date
        AND o.invoicedate < (${rangeEnd}::date + INTERVAL '1 day')
      GROUP BY o.customerid
    `

    return res.status(200).json({
      customerIds: rows.map(row => row.customerid),
      details: rows
    })
  } catch (error) {
    console.error('Failed to fetch customers with pending invoices:', error)

    return res.status(500).json({ error: 'Failed to fetch customers with pending invoices' })
  }
}
