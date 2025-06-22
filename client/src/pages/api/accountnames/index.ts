// this api will be used to give account code and account name for dropdown 
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch account details for dropdown
    const accounts = await prisma.$queryRaw`
      SELECT accountcode, accountname 
      FROM accounts_head
    `;

    res.status(200).json({ accounts });
  } catch (error) {
    console.error('Error fetching account names:', error);
    res.status(500).json({ error: 'Failed to fetch account names' });
  } finally {
    await prisma.$disconnect();
  }
}
