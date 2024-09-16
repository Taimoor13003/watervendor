import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'src/lib/prisma'; // Adjust the import path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', searchText = '', fromDate = '', toDate = '' } = req.query;

      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const offset = (pageNumber - 1) * limitNumber;
      const searchPattern = `%${searchText}%`;

      let whereClause = '';

      if (fromDate && toDate) {
        whereClause += ` WHERE o.orderdate BETWEEN '${fromDate}'::timestamp AND '${toDate}'::timestamp`;
      }

      if (searchPattern) {
        whereClause += `${whereClause ? ' AND' : ' WHERE'} CAST(o.orderdate AS varchar) ILIKE '%${searchPattern}%'`;
      }

      const finalQuery = `
        SELECT o.orderid, c.firstname, c.lastname, o.orderno, c.customerid, o.orderdate
        FROM orders o
        LEFT JOIN customer c ON o.customerid = c.customerid
        ${whereClause}
        LIMIT ${limitNumber}
        OFFSET ${offset}
        `;

      const orders = await prisma.$queryRawUnsafe(finalQuery);

      const finalCountQuery = `
      SELECT COUNT(*) AS count
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      ${whereClause}
      LIMIT ${limitNumber}
      OFFSET ${offset}
      `;

      const ordersCount: [{ count: number }] = await prisma.$queryRawUnsafe(finalCountQuery);

      const totalCount = ordersCount[0]?.count.toString() || '0';
      res.status(200).json({ data: orders, count: totalCount });
    } catch (error: any) {
      console.error('Error fetching orders:', error.message || error);
      res.status(500).json({ message: "Something went wrong!", error: error.message || error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
