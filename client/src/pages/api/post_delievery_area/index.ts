import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { deliveryarea } = req.body;

    if (!deliveryarea || typeof deliveryarea !== 'string') {
      return res.status(400).json({ error: 'Invalid delivery area' });
    }

    console.log('Inserting delivery area:', deliveryarea);

    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO pick_deliveryarea (deliveryarea) 
        VALUES ('${deliveryarea}')
      `);

      res.status(201).json({ message: 'Delivery area inserted successfully' });
    } catch (error) {
      console.error('Failed to insert delivery area:', error);
      res.status(500).json({ error: 'Failed to insert delivery area' });
    } finally {
      await prisma.$disconnect();
    }

    return;
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
