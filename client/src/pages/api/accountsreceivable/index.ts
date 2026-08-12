import { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  try {
    const { month, year } = req.query

    if (!month || !year) {
      return res.status(400).json({ error: 'Both month and year are required' })
    }

    const monthMap: { [key: string]: number } = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12
    }

    const monthNumber = monthMap[month as string]
    const yearNumber = parseInt(year as string, 10)

    if (!monthNumber || !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
      return res.status(400).json({ error: 'Invalid month or year' })
    }

    const periodStart = new Date(Date.UTC(yearNumber, monthNumber - 1, 1))
    const periodEnd = new Date(Date.UTC(yearNumber, monthNumber, 1))

    const result = await prisma.$queryRaw`
      SELECT c.customerid, c.accountno, c.firstname, c.lastname,
             COUNT(o.orderid)::int AS ordercount,
             COALESCE(SUM(COALESCE(o.orderamount, 0)), 0)::int AS balance,
             MIN(o.invoicedate) AS firstinvoicedate,
             MAX(o.invoicedate) AS lastinvoicedate
      FROM orders o
      JOIN customer c ON c.customerid = o.customerid
      WHERE COALESCE(o.ispaymentreceived, false) = false
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        AND o.invoicedate >= ${periodStart}
        AND o.invoicedate < ${periodEnd}
        AND COALESCE(c.isdeleted, false) = false
      GROUP BY c.customerid, c.accountno, c.firstname, c.lastname
      HAVING COALESCE(SUM(COALESCE(o.orderamount, 0)), 0) > 0
      ORDER BY balance DESC, c.accountno ASC
    `

    return res.status(200).json({ result })
  } catch (error) {
    console.error('❌ Error fetching accounts receivable:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
