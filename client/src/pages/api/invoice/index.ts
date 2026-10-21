import type { NextApiRequest, NextApiResponse } from 'next/types'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'
import { requireInvoiceAuth } from 'src/lib/require-invoice-auth'
import { issueInvoiceNumbers } from 'src/lib/invoice-numbering'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireInvoiceAuth(req, res))) return

  const { customerids, startDate, endDate } = req.query

  if (!customerids || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required query parameters' })
  }

  const parseCalendarDate = (value: string) => {
    // Only accept a calendar date. This avoids timezone shifts and makes the
    // date range match what the user selected in the invoice screen.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    const date = new Date(`${value}T00:00:00Z`)
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
  }

  const ci = typeof customerids === 'string' ? [...new Set(customerids.split(',').map(el => Number(el)))] : []
  const rangeStart = typeof startDate === 'string' ? parseCalendarDate(startDate) : null
  const rangeEnd = typeof endDate === 'string' ? parseCalendarDate(endDate) : null

  try {
    if (!ci.length || ci.some(id => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({ error: 'Customer IDs must be positive integers' })
    }

    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      return res
        .status(400)
        .json({ error: 'Start and end dates must be valid calendar dates, with start on or before end' })
    }

    const data: Array<{
      InvoiceDate: string
      returnqty: number
      rate_per_bottle: number
      firstname: string
      lastname: string
      addressres: string
      customerid: number
      [key: string]: any
    }> = await prisma.$queryRaw`
      SELECT invoicedate AS "InvoiceDate", COALESCE(od.returnqty, 0) AS "returnqty",
             COALESCE(od.unitprice, CASE WHEN o.orderqty > 0 THEN o.orderamount / o.orderqty ELSE NULL END, c.rate_per_bottle) AS "rate_per_bottle",
             c.firstname, c.lastname,
             NULLIF(TRIM(BOTH E' \n\t' FROM replace(c.addressres, E'\r', '')), '') AS "addressres", c.telephoneres, c.telephoneoffice,
             o.*, o.customerid , c.accountno
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      LEFT JOIN LATERAL (
        -- A handful of orders carry more than one detail line. Taking only the
        -- newest one dropped the rest of the returned bottles from the invoice,
        -- so returns are summed and the latest rate is used for pricing.
        SELECT SUM(COALESCE(d.returnqty, 0))::int AS returnqty,
               (ARRAY_AGG(d.unitprice ORDER BY d.id DESC))[1] AS unitprice
        FROM order_details d
        WHERE d.orderid = o.orderid
      ) od ON true
      WHERE o.customerid IN (${Prisma.join(ci)})
        AND o.invoicedate >= ${rangeStart}::date
        AND o.invoicedate < (${rangeEnd}::date + INTERVAL '1 day')
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        -- A paid order has left accounts receivable: it never appears on an
        -- invoice again (the desktop RMS rule).
        AND COALESCE(o.ispaymentreceived, false) = false
      ORDER BY o.customerid ASC, o.invoicedate ASC, o.orderid ASC
    `

    const requestedCustomers = await prisma.customer.findMany({
      where: { customerid: { in: ci }, OR: [{ isdeleted: false }, { isdeleted: null }] /* `not: true` drops NULL rows */ },
      select: { customerid: true, firstname: true, middlename: true, lastname: true }
    })
    const customerNames = requestedCustomers.reduce<Record<string, string>>((result, customer) => {
      if (customer.customerid) {
        result[String(customer.customerid)] = [customer.firstname, customer.middlename, customer.lastname]
          .filter(Boolean)
          .join(' ')
      }

      return result
    }, {})

    // Group data by customer ID
    const groupedData = data.reduce((acc: any, item: any) => {
      const id = item.customerid
      if (!acc[id]) {
        acc[id] = []
      }
      acc[id].push(item)

      return acc
    }, {})

    const invoiceNumbers = await issueInvoiceNumbers(data as any[], rangeStart, rangeEnd)

    res.status(200).json({ ...groupedData, __customerNames: customerNames, __invoiceNumbers: invoiceNumbers })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}
