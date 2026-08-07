import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { customerid, orderDate, invoiceDate, orderStatus, quantity, productId, returnedQty, ...rest } = req.body;
    const parsedCustomerId = parseInt(customerid, 10);
    const parsedQuantity = parseInt(quantity, 10);
    const parsedProductId = productId === undefined || productId === null || productId === '' ? 1 : parseInt(productId, 10);
    const parsedReturnedQty = returnedQty === undefined || returnedQty === null || returnedQty === '' ? null : parseInt(returnedQty, 10);

    // Basic validation
    if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0 || !orderDate || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0 || !orderStatus) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const parsedOrderDate = new Date(orderDate);
    const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : parsedOrderDate;
    if (Number.isNaN(parsedOrderDate.getTime()) || Number.isNaN(parsedInvoiceDate.getTime())) {
      return res.status(400).json({ message: 'Order and invoice dates must be valid' });
    }

    if (!['New', 'Completed', 'Cancel', 'Canceled'].includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    if (parsedProductId !== 1) {
      return res.status(400).json({ message: 'Only Bottle product is allowed' });
    }

    if (parsedReturnedQty !== null && (!Number.isInteger(parsedReturnedQty) || parsedReturnedQty < 0 || parsedReturnedQty > parsedQuantity)) {
      return res.status(400).json({ message: 'Returned quantity must be between zero and the order quantity' });
    }

    const customer = await prisma.customer.findFirst({
      where: { customerid: parsedCustomerId }
    });

    if (!customer || customer.rate_per_bottle === null || customer.rate_per_bottle === undefined) {
      return res.status(400).json({ message: 'Customer rate is missing' });
    }

    const unitPrice = Number(customer.rate_per_bottle);
    const totalAmount = parsedQuantity * unitPrice;

    await prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          customerid: parsedCustomerId,
          orderdate: parsedOrderDate,
          orderstatus: orderStatus,
          orderqty: parsedQuantity,
          orderamount: totalAmount,
          paymentmode: rest.paymentMode,
          deliveryaddress: rest.deliveryAddress,
          deliverydate: rest.deliveryDate ? new Date(rest.deliveryDate) : null,
          notes: rest.remarks,
          deliverynotes: rest.deliveryNotes,
          invoiceno: null,
          invoicedate: parsedInvoiceDate,
          telephone: rest.telephone,
          orderno: 'PENDING', // placeholder, updated below
        },
      });

      const updatedOrder = await tx.orders.update({
        where: { id: newOrder.id },
        data: {
          orderid: newOrder.id,
          orderno: `RO-${String(newOrder.id).padStart(6, '0')}`,
        },
      });

      await tx.order_details.create({
        data: {
          orderid: updatedOrder.id,
          productid: parsedProductId,
          quantity: parsedQuantity,
          unitprice: unitPrice,
          returnqty: parsedReturnedQty,
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
