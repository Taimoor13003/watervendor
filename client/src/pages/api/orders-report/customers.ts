import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export type OrdersReportCustomer = { customerid: number; name: string }

// The "Select Customer" choices on the Orders Report.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  try {
    const rows = await prisma.customer.findMany({
      where: { OR: [{ isdeleted: false }, { isdeleted: null }] /* `not: true` drops NULL rows */ },
      select: { customerid: true, firstname: true, middlename: true, lastname: true },
      orderBy: { firstname: 'asc' }
    })

    const customers: OrdersReportCustomer[] = rows
      .filter(row => row.customerid !== null && row.customerid !== undefined)
      .map(row => ({
        customerid: row.customerid as number,
        name: [row.firstname, row.middlename, row.lastname].filter(Boolean).join(' ') || `Customer ${row.customerid}`
      }))

    return res.status(200).json({ customers })
  } catch (error) {
    console.error('Failed to load customers for the orders report:', error)

    return res.status(500).json({ error: 'Failed to load customers' })
  }
}
