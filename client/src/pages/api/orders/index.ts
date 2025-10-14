import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '10',
        searchText = '',
        fromDate = '',
        toDate = ''
      } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const offset = (pageNumber - 1) * limitNumber;

      const search = (searchText as string)?.trim();

      const whereConditions: string[] = [];
      const values: any[] = [];

      if (fromDate && toDate) {
        whereConditions.push(`o.orderdate BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(new Date(fromDate as string), new Date(toDate as string));
      }

      if (search) {
        whereConditions.push(`(
          o.orderno ILIKE $${values.length + 1} OR
          TO_CHAR(o.orderdate, 'DD-MM-YYYY') ILIKE $${values.length + 1} OR
          CONCAT(c.firstname, ' ', c.lastname) ILIKE $${values.length + 1} OR
          c.firstname ILIKE $${values.length + 1} OR
          c.lastname ILIKE $${values.length + 1}
        )`);
        values.push(`%${search}%`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          o.orderid, 
          o.orderno, 
          o.orderdate, 
          c.firstname, 
          c.lastname, 
          c.customerid,
          COUNT(*) OVER() as total_count
        FROM orders o
        LEFT JOIN customer c ON c.customerid = o.customerid
        ${whereClause}
        ORDER BY o.orderdate DESC
        LIMIT ${limitNumber}
        OFFSET ${offset}
      `;

      const result = await prisma.$queryRawUnsafe<any[]>(query, ...values);

      const orders = result.map(({ total_count, ...order }) => order);
      const totalCount = result.length > 0 ? parseInt(result[0].total_count, 10) : 0;

      res.status(200).json({ data: orders, count: totalCount });
    } catch (error: any) {
      console.error('🔥 Error in /api/orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
