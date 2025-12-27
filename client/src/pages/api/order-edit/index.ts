import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';
import { serializeDate } from 'src/@core/utils/date';

type OrderRow = any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Missing order id' });
  }

  try {
    const orders = await prisma.$queryRaw<OrderRow[]>`
      SELECT 
        ep.empid, ep.firstname as employeeFirstName, ep.lastname as employeeLastName,
        c.customerid, c.firstname as customerFirstName, c.lastname as customerLastName,
        od.returnqty, od.productid, od.bottlereturndate,
        p.productname,
        o.*
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      LEFT JOIN employee_personal ep ON ep.empid = o.deliveredbyempid 
      LEFT JOIN order_details od ON o.orderid = od.orderid 
      LEFT JOIN products p ON p.id = od.productid
      WHERE o.orderid = ${Number(id)} AND (o.isdeleted IS DISTINCT FROM TRUE)
      LIMIT 1
    `;

    if (!orders || !orders.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentmode = await prisma.pick_paymentmode.findMany();
    const orderdetails = await prisma.order_details.findMany({
      where: { orderid: Number(id) },
    });

    const serializedOrders = orders.map(order => ({
      ...order,
      firstname:
        (order as any).customerfirstname ||
        (order as any).customerFirstName ||
        order.firstname,
      lastname:
        (order as any).customerlastname ||
        (order as any).customerLastName ||
        order.lastname,
      orderdate: serializeDate(order.orderdate as unknown as Date),
      invoicedate: serializeDate(order.invoicedate as unknown as Date),
      invoicelastprintdate: serializeDate(order.invoicelastprintdate as unknown as Date),
      deliverydate: serializeDate(order.deliverydate as unknown as Date),
      bottlereturndate: serializeDate((order as any).bottlereturndate),
    }));

    const serializedOrderDetails = orderdetails.map(detail => ({
      ...detail,
      bottlereturndate: serializeDate(detail.bottlereturndate as unknown as Date),
    }));

    return res.status(200).json({
      orders: serializedOrders[0],
      paymentmode,
      orderdetails: serializedOrderDetails,
    });
  } catch (error: any) {
    console.error('Error loading order edit data:', error);
    return res.status(500).json({ message: 'Failed to load order' });
  } finally {
    await prisma.$disconnect();
  }
}
