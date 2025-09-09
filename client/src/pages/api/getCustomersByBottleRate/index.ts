import type { NextApiRequest, NextApiResponse } from 'next/types'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    const { rate } = req.query;

    if (rate == null || rate == '') {
      return res.status(400).json({ error: 'Missing rate parameter' });
    }

    const rateNumber = Number(rate);

    if (isNaN(rateNumber) || rateNumber < 0) {
      return res.status(400).json({ error: 'Rate must be a positive number' });
    }

    // Fetch only customers with this rate_per_bottle
    const customers = await prisma.customer.findMany({
      where: { rate_per_bottle: rateNumber },
      orderBy: { firstname: 'asc' },
    });


    console.log('customers:', customers)

    res.status(200).json(customers)
  } catch (error) {
    console.error('Failed to fetch delivery areas:', error)
    res.status(500).json({ error: 'Failed to fetch delivery areas' })
  } finally {
    await prisma.$disconnect()
  }
}
