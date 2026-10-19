import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';
import { requireApiAuth } from 'src/lib/require-invoice-auth'
import { parseCalendarDate } from 'src/lib/calendar-date'

// Arbitrary but fixed key: serialises order-number allocation across requests.
const ORDER_NUMBER_LOCK = 918273645

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);

    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!(await requireApiAuth(req, res))) return

  try {
    const { customerid, orderDate, invoiceDate, orderStatus: rawOrderStatus, quantity, productId, returnedQty, ...rest } = req.body;
    // New orders start as "New" unless staff picked another status.
    const orderStatus = typeof rawOrderStatus === 'string' && rawOrderStatus.trim() ? rawOrderStatus.trim() : 'New';
    // Bottle counts must be whole numbers: parseInt turned "2.5" into 2 silently.
    const toWholeNumber = (value: unknown) =>
      typeof value === 'number' || (typeof value === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(value)) ? Number(value) : NaN;
    const parsedCustomerId = toWholeNumber(customerid);
    const parsedQuantity = toWholeNumber(quantity);
    const parsedProductId = productId === undefined || productId === null || productId === '' ? 1 : parseInt(productId, 10);
    const parsedReturnedQty = returnedQty === undefined || returnedQty === null || returnedQty === '' ? null : toWholeNumber(returnedQty);

    // Basic validation
    if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0 || !orderDate || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Order dates are calendar days; see src/lib/calendar-date.ts.
    const parsedOrderDate = parseCalendarDate(orderDate);
    const parsedInvoiceDate = invoiceDate ? parseCalendarDate(invoiceDate) : parsedOrderDate;
    if (!parsedOrderDate || !parsedInvoiceDate) {
      return res.status(400).json({ message: 'Order and invoice dates must be valid' });
    }

    if (!['New', 'In Progress', 'Completed', 'Cancel', 'Canceled'].includes(orderStatus)) {
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

    const orderId = await prisma.$transaction(async (tx) => {
      // `orders.id` (the autoincrement primary key) and `orders.orderid` (the
      // business key everything else joins on) are NOT the same sequence in the
      // imported client database: id tops out well below orderid. Deriving orderid
      // from id therefore hands a brand new order an orderid that an existing order
      // already owns, and order_details rows silently attach to both. Allocate from
      // MAX(orderid) instead, under an advisory lock so two concurrent creates
      // cannot claim the same number.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ORDER_NUMBER_LOCK})`;

      const [{ nextid }] = await tx.$queryRaw<Array<{ nextid: number }>>`
        SELECT (COALESCE(MAX(orderid), 0) + 1)::int AS nextid FROM orders
      `;

      let allocatedId = Number(nextid);
      let orderNo = `RO-${allocatedId}`;

      // orderno carries a historical duplicate (RO-31031), so confirm both keys are
      // free rather than trusting the arithmetic alone.
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const clash = await tx.orders.findFirst({
          where: { OR: [{ orderid: allocatedId }, { orderno: orderNo }] },
          select: { id: true },
        });

        if (!clash) break;

        allocatedId += 1;
        orderNo = `RO-${allocatedId}`;
      }

      const newOrder = await tx.orders.create({
        data: {
          orderid: allocatedId,
          orderno: orderNo,
          customerid: parsedCustomerId,
          orderdate: parsedOrderDate,
          orderstatus: orderStatus,
          orderqty: parsedQuantity,
          orderamount: totalAmount,
          paymentmode: rest.paymentMode,
          deliveryaddress: rest.deliveryAddress,
          // The desktop has no separate delivery date: it is the order date.
          deliverydate: parseCalendarDate(rest.deliveryDate) ?? parsedOrderDate,
          notes: rest.remarks,
          deliverynotes: rest.deliveryNotes,
          invoiceno: null,
          invoicedate: parsedInvoiceDate,
          telephone: rest.telephone,
          isdeleted: false,
          modifydate: new Date(),
        },
      });

      await tx.order_details.create({
        data: {
          // order_details joins on orders.orderid, never on orders.id.
          orderid: newOrder.orderid,
          productid: parsedProductId,
          quantity: parsedQuantity,
          unitprice: unitPrice,
          returnqty: parsedReturnedQty,
          bottlereturndate: parseCalendarDate(rest.bottleReturnedDate),
        },
      });

      return { orderid: newOrder.orderid, orderno: newOrder.orderno };
    });

    return res.status(201).json({ message: 'Order created successfully', ...orderId });
  } catch (error: any) {
    console.error('🔥 Error creating order:', error);

    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
}
