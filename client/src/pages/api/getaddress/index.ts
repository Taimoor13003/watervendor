import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { deliveryarea } = req.body;

    if (!deliveryarea || typeof deliveryarea !== 'string') {
      return res.status(400).json({ error: 'Invalid delivery area' });
    }

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

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
      await prisma.$executeRawUnsafe(`
        DELETE FROM pick_deliveryarea WHERE id = ${id}
      `);

      res.status(200).json({ message: 'Delivery area deleted successfully' });
    } catch (error) {
      console.error('Failed to delete delivery area:', error);
      res.status(500).json({ error: 'Failed to delete delivery area' });
    } finally {
      await prisma.$disconnect();
    }

    return;
  }

  if (req.method === 'GET') {
    try {
      const data = await prisma.pick_deliveryarea.findMany();
      res.status(200).json(data);
    } catch (error) {
      console.error('Failed to fetch delivery areas:', error);
      res.status(500).json({ error: 'Failed to fetch delivery areas' });
    } finally {
      await prisma.$disconnect();
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
