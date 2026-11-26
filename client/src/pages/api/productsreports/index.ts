import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  try {
    const result = await prisma.products.findMany({
      where: { OR: [{ isdeleted: false }, { isdeleted: null }] /* `not: true` drops NULL rows */ },
      orderBy: [{ productname: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        productid: true,
        productcode: true,
        productname: true,
        unitsinstock: true,
        totalunits: true,
        rateperunitcash: true,
        isactive: true
      }
    })

    return res.status(200).json({ result })
  } catch (error) {
    console.error('Error fetching product data:', error)

    return res.status(500).json({ error: 'Failed to fetch product report' })
  }
}
