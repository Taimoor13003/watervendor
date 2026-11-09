import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

const ROW_LIMIT = 5000
const DAY = /^\d{4}-\d{2}-\d{2}$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const startDate = String(req.query.startDate || '')
  const endDate = String(req.query.endDate || '')

  if (!DAY.test(startDate) || !DAY.test(endDate)) {
    return res.status(400).json({ error: 'A valid from and to date are required' })
  }

  if (startDate > endDate) {
    return res.status(400).json({ error: 'The "from" date must be on or before the "to" date' })
  }

  try {
    // Bottles move on the day they are delivered; orders without a delivery
    // date fall back to their order date.
    const days = await prisma.$queryRaw`
      SELECT
        to_char(COALESCE(o.deliverydate, o.orderdate)::date, 'YYYY-MM-DD') AS "day",
        COALESCE(SUM(od.quantity), 0)::int AS "delivered",
        COALESCE(SUM(od.returnqty), 0)::int AS "returned",
        COALESCE(SUM(GREATEST(COALESCE(od.quantity, 0) - COALESCE(od.returnqty, 0), 0)), 0)::int AS "extraout",
        COALESCE(SUM(GREATEST(COALESCE(od.returnqty, 0) - COALESCE(od.quantity, 0), 0)), 0)::int AS "extrain"
      FROM orders o
      JOIN order_details od ON od.orderid = o.orderid
      WHERE COALESCE(o.deliverydate, o.orderdate)::date BETWEEN ${startDate}::date AND ${endDate}::date
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
      GROUP BY 1
      ORDER BY 1 ASC
    `

    // The customers behind each day's extra bottles: deliveries where the
    // bottles given and taken back differ.
    const rows = await prisma.$queryRaw`
      SELECT
        od.id AS "rowid",
        to_char(COALESCE(o.deliverydate, o.orderdate)::date, 'YYYY-MM-DD') AS "day",
        o.orderid,
        o.orderno,
        o.customerid,
        c.firstname,
        c.lastname,
        COALESCE(od.quantity, 0)::int AS "quantity",
        COALESCE(od.returnqty, 0)::int AS "returnqty",
        (COALESCE(od.quantity, 0) - COALESCE(od.returnqty, 0))::int AS "extra"
      FROM orders o
      JOIN order_details od ON od.orderid = o.orderid
      LEFT JOIN customer c ON c.customerid = o.customerid
      WHERE COALESCE(o.deliverydate, o.orderdate)::date BETWEEN ${startDate}::date AND ${endDate}::date
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        AND COALESCE(od.quantity, 0) <> COALESCE(od.returnqty, 0)
      ORDER BY 2 ASC, c.firstname ASC NULLS LAST, c.lastname ASC NULLS LAST, o.customerid ASC, o.orderid ASC
      LIMIT ${ROW_LIMIT}
    `

    const customers = rows as any[]

    return res.status(200).json({
      days,
      customers,
      truncated: customers.length >= ROW_LIMIT,
      rowLimit: ROW_LIMIT
    })
  } catch (error) {
    console.error('Error fetching daily inventory data:', error)

    return res.status(500).json({ error: 'Failed to load the daily inventory report' })
  }
}
