import { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, voucherTypeId } = req.query;

    if (!startDate || !endDate || !voucherTypeId) {
      return res.status(400).json({ error: 'startDate, endDate, and voucherTypeId are required' });
    }

    const start = new Date(startDate as string).toISOString();
    const end = new Date(endDate as string).toISOString();

    console.log(voucherTypeId  ,start , end , "saqib")

     
      const result = await prisma.$queryRaw`
       SELECT 
    v.voucherno, 
    v.voucherdate,
    json_agg(
        json_build_object(
            'debitamount', vt.debitamount,
            'creditamount', vt.creditamount,
            'accountcode', vt.accountcode,
            'chqno', vt.chqno
        )
    ) AS transactions
FROM 
    vouchers v
LEFT JOIN 
    voucher_trans vt 
    ON v.voucherno = vt.voucherno
WHERE 
    v.vouchertype = ${voucherTypeId}::integer
    AND v.voucherdate BETWEEN ${start}::timestamp AND ${end}::timestamp
GROUP BY 
    v.voucherno, v.voucherdate;

          `;

    console.log('Query Resultttttttt:', result);
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch general journal report' });
  } finally {
    await prisma.$disconnect();
  }
}


    