import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        customerid: true,
        firstname: true,
        lastname: true
      },
      orderBy: {
        firstname: 'asc'
      }
    });

    res.status(200).json({ customers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  } finally {
    await prisma.$disconnect();
  }
}
