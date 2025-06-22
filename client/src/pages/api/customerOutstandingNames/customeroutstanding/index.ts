// pages/api/customer-orders.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: { method: string; query: { customerId: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: unknown): any; new(): any; }; }; }) {
  if (req.method === 'GET') {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    try {
      const orders = await prisma.$queryRaw`
        SELECT 
          o.orderno, 
          o.orderdate, 
          o.deliveredbyempid, 
          o.deliverydate, 
          o.invoiceno, 
          o.invoicedate, 
          o.customerid, 
          c.firstname, 
          c.lastname,
          od.quantity, 
          od.returnqty 
        FROM orders o
        LEFT JOIN order_details od ON od.orderid = o.orderid 
        LEFT JOIN customer c ON c.customerid = o.customerid 
        WHERE c.customerid = ${parseInt(customerId, 10)}
      `;


      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
