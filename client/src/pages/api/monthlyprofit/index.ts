import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { month, year } = req.query
  if (typeof month !== 'string' || !month || typeof year !== 'string' || !/^\d{4}$/.test(year)) {
    return res.status(400).json({ error: 'A valid month and year are required' })
  }

  try {
    const result = await prisma.monthly_profit.findMany({
      where: { monthname: month, monthyear: year },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        monthname: true,
        monthyear: true,
        income: true,
        expenses: true,
        actualprofit: true
      }
    })

    return res.status(200).json({ result })
  } catch {
    return res.status(500).json({ error: 'Failed to fetch monthly profit data' })
  }
}
