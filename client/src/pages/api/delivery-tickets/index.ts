import type { NextApiRequest, NextApiResponse } from 'next/types'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export type DeliveryTicketRow = {
  customerid: number
  accountno: string | null
  name: string
  address: string | null
  area: string | null
  telephone: string | null
  paymentmode: string | null
  deliveryperson: number | null
  deliverypersonname: string | null
}

// customer_schedule keeps one flag column per weekday, as in the desktop RMS.
const DAY_COLUMNS: Record<string, string> = {
  sunday: 'issunday',
  monday: 'ismonday',
  tuesday: 'istuesday',
  wednesday: 'iswednesday',
  thursday: 'isthursday',
  friday: 'isfriday',
  saturday: 'issaturday'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const dayColumn = DAY_COLUMNS[String(req.query.day || '').toLowerCase()]
  if (!dayColumn) {
    return res.status(400).json({ error: 'Select a day of the week' })
  }

  const empParam = String(req.query.empid || '')
  const empid = empParam ? Number(empParam) : null
  if (empParam && !Number.isInteger(empid)) {
    return res.status(400).json({ error: 'Invalid delivery person' })
  }

  try {
    // Customers scheduled for that weekday (desktop RMS: Reports > Todays
    // Schedule Orders > Print Invoices), grouped by delivery person so each driver's
    // tickets come out together.
    const rows = await prisma.$queryRaw<DeliveryTicketRow[]>`
      SELECT
        c.customerid,
        c.accountno,
        TRIM(CONCAT_WS(' ', NULLIF(TRIM(c.firstname), ''), NULLIF(TRIM(c.lastname), ''))) AS "name",
        COALESCE(NULLIF(TRIM(c.addressres), ''), NULLIF(TRIM(c.addressoffice), '')) AS "address",
        COALESCE(NULLIF(TRIM(c.deliveryarea), ''), NULLIF(TRIM(c.areares), '')) AS "area",
        COALESCE(NULLIF(TRIM(c.telephoneres), ''), NULLIF(TRIM(c.telephoneoffice), '')) AS "telephone",
        c.paymentmode,
        c.delivery_person AS "deliveryperson",
        TRIM(CONCAT_WS(' ', e.firstname, e.lastname)) AS "deliverypersonname"
      FROM customer c
      JOIN customer_schedule s ON s.customerid = c.customerid
      LEFT JOIN LATERAL (
        SELECT firstname, lastname
        FROM employee_personal ep
        WHERE ep.empid = c.delivery_person
        ORDER BY ep.id DESC
        LIMIT 1
      ) e ON true
      WHERE COALESCE(s.${Prisma.raw(dayColumn)}, false) = true
        AND COALESCE(c.isdeleted, false) = false
        AND c.accountclosedate IS NULL
        ${empid !== null ? Prisma.sql`AND c.delivery_person = ${empid}` : Prisma.empty}
      ORDER BY "deliverypersonname" ASC NULLS LAST, "area" ASC NULLS LAST, c.accountno ASC NULLS LAST, c.customerid ASC
    `

    return res.status(200).json({ customers: rows })
  } catch (error) {
    console.error('Error fetching delivery tickets:', error)

    return res.status(500).json({ error: 'Failed to load the delivery tickets' })
  }
}
