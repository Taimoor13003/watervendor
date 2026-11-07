import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

const ROW_LIMIT = 5000

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { empId } = req.query
  const parsedEmpId = Number(empId)

  if (!empId || !Number.isInteger(parsedEmpId) || parsedEmpId <= 0) {
    return res.status(400).json({ error: 'A valid employee is required' })
  }

  try {
    // Same rows as the Customer Outstanding report, but for the deliveries one
    // employee made, grouped by customer like the desktop RMS Inventory >
    // Employee Outstanding report.
    const rows = await prisma.$queryRaw`
      SELECT
        COALESCE('d' || od.id::text, 'o' || o.id::text) AS "rowid",
        o.orderid,
        o.orderno,
        o.orderdate,
        o.deliveredbyempid,
        NULLIF(TRIM(CONCAT_WS(' ', e.firstname, e.lastname)), '') AS "employeename",
        o.deliverydate,
        o.invoiceno,
        o.invoicedate,
        o.orderstatus,
        o.customerid,
        c.firstname,
        c.lastname,
        COALESCE(od.quantity, 0)::int AS "quantity",
        COALESCE(od.returnqty, 0)::int AS "returnqty",
        (COALESCE(od.quantity, 0) - COALESCE(od.returnqty, 0))::int AS "bottlesoutstanding"
      FROM orders o
      LEFT JOIN order_details od ON od.orderid = o.orderid
      LEFT JOIN customer c ON c.customerid = o.customerid
      LEFT JOIN LATERAL (
        SELECT firstname, lastname
        FROM employee_personal
        WHERE empid = o.deliveredbyempid
        ORDER BY id DESC
        LIMIT 1
      ) e ON true
      WHERE o.deliveredbyempid = ${parsedEmpId}
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        AND COALESCE(od.quantity, 0) <> COALESCE(od.returnqty, 0)
      -- Orders of customers missing from the imported customer table sort last.
      ORDER BY c.firstname ASC NULLS LAST, c.lastname ASC NULLS LAST, o.customerid ASC,
               o.orderdate ASC NULLS LAST, o.orderid ASC
      LIMIT ${ROW_LIMIT}
    `

    const result = rows as any[]

    return res.status(200).json({ result, truncated: result.length >= ROW_LIMIT, rowLimit: ROW_LIMIT })
  } catch (error) {
    console.error('Error fetching employee outstanding data:', error)

    return res.status(500).json({ error: 'Failed to load the employee outstanding report' })
  }
}
