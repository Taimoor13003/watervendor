import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const customers = await prisma.customer.findMany({
      where: { isdeleted: { not: true } },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        customerid: true,
        firstname: true,
        middlename: true,
        lastname: true,
        customertype: true,
        paymentmode: true,
        telephoneres: true,
        telephoneoffice: true,
        email: true,
        accountno: true
      }
    })

    res.status(200).json({ customers })
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
}
