import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export type OrdersReportRow = {
  orderid: number | null
  orderno: string | null
  orderdate: Date | null
  customerid: number | null
  customername: string | null
  telephone: string | null
  deliveryaddress: string | null
  deliveryarea: string | null
  deliverydate: Date | null
  orderqty: number | null
  orderstatus: string | null
}

export const ORDER_REPORT_MODES = ['date', 'status', 'customer'] as const
export type OrderReportMode = (typeof ORDER_REPORT_MODES)[number]

const ROW_LIMIT = 5000

const parseCalendarDate = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { startDate, endDate, reportBy, status, customerId } = req.query

  const rangeStart = parseCalendarDate(startDate)
  const rangeEnd = parseCalendarDate(endDate)

  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return res
      .status(400)
      .json({ error: 'Report From and Report To must be valid dates, with From on or before To' })
  }

  const mode = (typeof reportBy === 'string' ? reportBy : 'date') as OrderReportMode
  if (!ORDER_REPORT_MODES.includes(mode)) {
    return res.status(400).json({ error: 'Unknown report grouping' })
  }

  // Each grouping narrows the report to one status or customer. The
  // filter is optional: leaving it blank reports on every value in the range.
  const statusFilter = mode === 'status' && typeof status === 'string' && status ? status : null
  const parsedCustomerId = mode === 'customer' && customerId ? Number(customerId) : null

  if (parsedCustomerId !== null && (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0)) {
    return res.status(400).json({ error: 'Customer must be a valid selection' })
  }

  try {
    const rows = await prisma.$queryRaw<OrdersReportRow[]>`
      SELECT o.orderid, o.orderno, o.orderdate, o.customerid,
             NULLIF(TRIM(CONCAT_WS(' ', c.firstname, c.middlename, c.lastname)), '') AS "customername",
             COALESCE(NULLIF(o.telephone, ''), NULLIF(c.telephoneres, ''), NULLIF(c.telephoneoffice, '')) AS "telephone",
             -- Imported addresses carry CR line endings and already end with their
             -- own "Delivery Area : X" line. Strip both so the report can lay the
             -- address and the delivery area out itself.
             NULLIF(TRIM(BOTH E' \n\t' FROM
               regexp_replace(
                 replace(COALESCE(NULLIF(o.deliveryaddress, ''), c.addressres, ''), E'\r', ''),
                 E'\n?[ \t]*Delivery Area[ \t]*:[^\n]*', '', 'g')
             ), '') AS "deliveryaddress",
             o.deliveryarea, o.deliverydate, o.orderqty, o.orderstatus
      FROM orders o
      LEFT JOIN customer c ON c.customerid = o.customerid
      WHERE COALESCE(o.isdeleted, false) = false
        AND o.orderdate >= ${rangeStart}::date
        AND o.orderdate < (${rangeEnd}::date + INTERVAL '1 day')
        -- Older records spell the cancelled status "Canceled".
        AND (${statusFilter}::text IS NULL OR o.orderstatus = ${statusFilter}
             OR (${statusFilter} = 'Cancel' AND o.orderstatus = 'Canceled'))
        AND (${parsedCustomerId}::int IS NULL OR o.customerid = ${parsedCustomerId})
      ORDER BY
        CASE WHEN ${mode} = 'customer' THEN NULLIF(TRIM(CONCAT_WS(' ', c.firstname, c.middlename, c.lastname)), '') END ASC NULLS LAST,
        CASE WHEN ${mode} = 'status' THEN o.orderstatus END ASC NULLS LAST,
        o.orderdate ASC, o.orderid ASC
      LIMIT ${ROW_LIMIT}
    `

    // The report is capped so a very wide range cannot exhaust memory. Say so
    // rather than silently returning a partial report.
    const truncated = rows.length >= ROW_LIMIT

    return res.status(200).json({ result: rows, reportBy: mode, truncated, rowLimit: ROW_LIMIT })
  } catch (error) {
    console.error('Failed to build the orders report:', error)

    return res.status(500).json({ error: 'Failed to build the orders report' })
  }
}
