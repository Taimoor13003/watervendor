import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { accountcode, vouchertype = "1", voucherperiodfrom, voucherperiodto } = req.query;

  try {
    if (!accountcode || !vouchertype || typeof vouchertype === 'object' || !voucherperiodfrom || !voucherperiodto) {
      throw new Error('invalid payload')
    }
    const type = parseFloat(vouchertype)
    const fromDate = new Date(voucherperiodfrom as string);
    const toDate = new Date(voucherperiodto as string);
    const result = await prisma.$queryRaw`
    SELECT * FROM voucher_trans vt
    LEFT JOIN accounts_head ah ON ah.accountcode = vt.accountcode
    LEFT JOIN vouchers v ON vt.voucherno = v.voucherno
    LEFT JOIN accounts_head ah2 ON ah2.accountcode = vt.accountcode
    WHERE v.voucherdate BETWEEN ${fromDate} AND ${toDate}
    AND v.vouchertype = ${type} AND ah.accountcode = ${accountcode} 
`;

console.log( `SELECT * FROM voucher_trans vt
  LEFT JOIN accounts_head ah ON ah.accountcode = vt.accountcode
  LEFT JOIN vouchers v ON vt.voucherno = v.voucherno
  LEFT JOIN accounts_head ah2 ON ah2.accountcode = vt.accountcode
  WHERE v.voucherdate BETWEEN ${fromDate} AND ${toDate}
  AND v.vouchertype = ${type} AND ah.accountcode = ${accountcode}`,'queryyyyyyyy')

  
    return res.status(200).json({ result });

  } catch (error) {
    console.error('Failed to fetch account details:', error);
    
    return res.status(500).json({ error: 'Failed to fetch account details' });
  } finally {
    await prisma.$disconnect();
  }
}
