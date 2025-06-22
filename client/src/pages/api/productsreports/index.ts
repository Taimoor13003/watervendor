import { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await prisma.$queryRaw`SELECT * FROM products p`;

    console.log('Query Result:', result);
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching product data:', error);
    return res.status(500).json({ error: 'Failed to fetch product report' });
  } finally {
    await prisma.$disconnect();
  }
}
