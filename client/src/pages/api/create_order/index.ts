import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { customerid, orderDate, orderStatus, quantity, unitPrice, totalAmount, ...rest } = req.body;

    // Basic validation
    if (!customerid || !orderDate || !quantity || !unitPrice || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          customerid: parseInt(customerid),
          orderdate: new Date(orderDate),
          orderstatus: orderStatus,
          orderqty: parseInt(quantity),
          orderamount: parseFloat(totalAmount),
          paymentmode: rest.paymentMode,
          deliveryaddress: rest.deliveryAddress,
          deliverydate: rest.deliveryDate ? new Date(rest.deliveryDate) : null,
          notes: rest.remarks,
          deliverynotes: rest.deliveryNotes,
          invoiceno: rest.invoiceNo ? parseInt(rest.invoiceNo) : null,
          invoicedate: rest.invoiceDate ? new Date(rest.invoiceDate) : null,
          telephone: rest.telephone,
          orderno: `ORD-${Date.now()}`,
        },
      });

      const updatedOrder = await tx.orders.update({
        where: { id: newOrder.id },
        data: { orderid: newOrder.id },
      });

      await tx.order_details.create({
        data: {
          orderid: updatedOrder.id,
          productid: 1, // Assuming 'Bottle' has a productid of 1
          quantity: parseInt(quantity),
          unitprice: parseFloat(unitPrice),
          returnqty: rest.returnedQty ? parseInt(rest.returnedQty) : null,
          bottlereturndate: rest.bottleReturnedDate ? new Date(rest.bottleReturnedDate) : null,
        },
      });
    });

    return res.status(201).json({ message: 'Order created successfully' });
  } catch (error: any) {
    console.error('🔥 Error creating order:', error);

    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
}
