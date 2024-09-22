import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accountname, voucherperiodfrom, voucherperiodto } = req.query;

  try {
    // Fetch account details for dropdown
    const accounts = await prisma.$queryRaw`
      SELECT accountcode, accountname FROM accounts_head
    `;

    // If the request has voucherperiodfrom and voucherperiodto, fetch the voucher details
    if (voucherperiodfrom && voucherperiodto) {
      const fromDate = new Date(voucherperiodfrom as string);
      const toDate = new Date(voucherperiodto as string);

      const results = await prisma.$queryRaw`
        SELECT vt.*, v.*, ah.accountname AS account_name
        FROM voucher_trans vt
        LEFT JOIN accounts_head ah ON ah.accountcode = vt.accountcode
        LEFT JOIN vouchers v ON vt.voucherno = v.voucherno
        WHERE v.voucherdate BETWEEN ${fromDate} AND ${toDate}
        AND v.vouchertype = 2
        ${accountname ? prisma.$queryRaw`AND TRIM(ah.accountname) ILIKE TRIM(${accountname})` : prisma.$queryRaw``}
      `;

      return res.status(200).json({ results, accounts });
    }

    return res.status(200).json({ accounts });
  } catch (error) {
    console.error('Failed to fetch account details:', error);

    return res.status(500).json({ error: 'Failed to fetch account details' });
  } finally {
    await prisma.$disconnect();
  }
}
