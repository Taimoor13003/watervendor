// File: src/pages/api/recieved/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'src/lib/prisma'    // adjust this path to wherever your prisma client lives

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    // Fetch only `accountno` from all customers, ordered descending
    const rows = await prisma.customer.findMany({
      select: { accountno: true },
      orderBy: { accountno: 'desc' }
    })

    // Return as a raw array of { accountno }
    return res.status(200).json(rows)
  } catch (error) {
    console.error('Error in /api/recieved:', error)
    return res
      .status(500)
      .json({ message: 'Failed to load customer account numbers' })
  }
}
