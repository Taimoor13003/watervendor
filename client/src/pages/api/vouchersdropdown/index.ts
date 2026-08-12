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
    const vouchers = await prisma.$queryRaw`
      SELECT * FROM pick_paymentmode
    `

    res.status(200).json({ vouchers })
  } catch (error) {
    console.error('Error fetching voucher types:', error)
    res.status(500).json({ error: 'Failed to fetch voucher types' })
  }
}
