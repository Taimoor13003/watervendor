import type { NextApiRequest, NextApiResponse } from 'next/types'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await prisma.pick_deliveryarea.findMany()

    res.status(200).json(data)
  } catch (error) {
    console.error('Failed to fetch delivery areas:', error)
    res.status(500).json({ error: 'Failed to fetch delivery areas' })
  } finally {
    await prisma.$disconnect()
  }
}
