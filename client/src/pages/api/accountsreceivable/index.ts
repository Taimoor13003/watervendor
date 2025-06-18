import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Both month and year are required' });
    }

    const monthMap: { [key: string]: number } = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
    };

    const monthNumber = monthMap[month as string];
    const yearNumber = parseInt(year as string);

    if (!monthNumber || isNaN(yearNumber)) {
      return res.status(400).json({ error: 'Invalid month or year' });
    }

    const startDate = new Date(yearNumber, monthNumber - 1, 1);
    const endDate = new Date(yearNumber, monthNumber, 0, 23, 59, 59); // end of the month

    console.log(`✅ Fetching accounts receivable for: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const result = await prisma.$queryRaw`
      SELECT 
        c.firstname, 
        c.lastname, 
        o.orderno, 
        o.orderdate,
        o.invoiceno,
        o.invoicedate,
        o.orderamount,
        o.*
      FROM orders o
      LEFT JOIN customer c ON c.customerid = o.customerid
      WHERE o.ispaymentreceived = true
        AND o.orderdate >= ${startDate.toISOString()}::timestamp
        AND o.orderdate <= ${endDate.toISOString()}::timestamp
    `;

    return res.status(200).json({ result });
  } catch (error) {
    console.error('❌ Error fetching accounts receivable:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
