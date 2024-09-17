// pages/api/vouchersdropdown/vouchers.ts
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch voucher types
    const vouchers = await prisma.$queryRaw`
      SELECT * FROM pick_paymentmode
    `;

    res.status(200).json({ vouchers });
  } catch (error) {
    console.error('Error fetching voucher types:', error);
    res.status(500).json({ error: 'Failed to fetch voucher types' });
  } finally {
    await prisma.$disconnect();
  }
}
