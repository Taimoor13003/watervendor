import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { rate } = req.query;

  if (typeof rate !== 'string') {
    return res.status(400).json({ error: 'Invalid rate parameter' });
  }

  try {
    // Convert rate to a number
    const ratePerBottle = parseFloat(rate);

    // Fetch data from the database
    const data = await prisma.customer.findMany({
      where: {
        rate_per_bottle: ratePerBottle,
      },
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  } finally {
    await prisma.$disconnect();
  }
}
