import type { NextApiRequest, NextApiResponse } from 'next/types';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { customerids, startDate, endDate } = req.query;

  if (!customerids || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const ci = typeof customerids === 'string' ? customerids.split(",").map((el: string) => parseInt(el)) : [];

  try {
    if (!Array.isArray(ci) || ci.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid customer IDs' });
    }

    const data: Array<{
      InvoiceDate: string;
      reqbottles: number;
      rate_per_bottle: number;
      firstname: string;
      lastname: string;
      addressres: string;
      customerid: number;
      [key: string]: any;
    }> = await prisma.$queryRaw`
      SELECT invoicedate AS "InvoiceDate", c.reqbottles, c.rate_per_bottle, c.firstname, c.lastname,
             c.addressres, o.*, o.customerid
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      WHERE o.customerid IN (${Prisma.join(ci)})
        AND orderdate BETWEEN ${new Date(startDate as string).toISOString()}::timestamp
        AND ${new Date(endDate as string).toISOString()}::timestamp;
    `;

    // Group data by customer ID
    const groupedData = data.reduce((acc: any, item: any) => {
      const id = item.customerid;
      if (!acc[id]) {
        acc[id] = [];
      }
      acc[id].push(item);

      return acc;
      
    }, {});

    res.status(200).json(groupedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  } finally {
    await prisma.$disconnect();
  }
}
