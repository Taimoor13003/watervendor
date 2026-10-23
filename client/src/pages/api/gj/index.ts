import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';

const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate, voucherTypeId } = req.query;

    if (!startDate || !endDate || voucherTypeId === undefined || voucherTypeId === '') {
      return res.status(400).json({ error: 'startDate, endDate, and voucherTypeId are required' });
    }

    const start = String(startDate);
    const end = String(endDate);
    const typeId = Number(voucherTypeId);

    if (!CALENDAR_DAY.test(start) || !CALENDAR_DAY.test(end) || start > end) {
      return res.status(400).json({ error: 'startDate and endDate must be YYYY-MM-DD, with startDate on or before endDate' });
    }

    if (!Number.isInteger(typeId)) {
      return res.status(400).json({ error: 'voucherTypeId must be a number' });
    }

    // Whole calendar days, like Account Reports. The old BETWEEN two midnight
    // timestamps only matched an instant, so any time of day on the last date
    // fell outside the period.
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
      FROM vouchers v
      LEFT JOIN voucher_trans vt ON v.voucherno = vt.voucherno
      WHERE v.vouchertype = ${typeId}
        AND v.voucherdate >= ${start}::date
        AND v.voucherdate < (${end}::date + INTERVAL '1 day')
      GROUP BY v.voucherno, v.voucherdate
      ORDER BY v.voucherdate ASC, v.voucherno ASC
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching data:', error);

    return res.status(500).json({ error: 'Failed to fetch general journal report' });
  }
}
