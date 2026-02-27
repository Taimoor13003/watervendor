import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

const toNumberOrNull = (value: any) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

const toDateOrNull = (value: any) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { orderid, productid, returnqty, bottlereturndate, ...rest } = req.body
    const numericOrderId = Number(orderid)
    const parsedOrderQtyRaw = toNumberOrNull(rest.orderqty)
    const parsedReturnQty = toNumberOrNull(returnqty)
    const parsedInvoiceNo = toNumberOrNull(rest.invoiceno)
    const parsedProductId = toNumberOrNull(productid) ?? 1
    const normalizedOrderStatus = typeof rest.orderstatus === 'string' ? rest.orderstatus.trim() : ''

    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      return res.status(400).json({ message: 'Order ID is required' })
    }

    if (parsedOrderQtyRaw === null || !Number.isInteger(parsedOrderQtyRaw) || parsedOrderQtyRaw < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' })
    }
    const parsedOrderQty: number = parsedOrderQtyRaw

    if (!['New', 'Completed', 'Cancel', 'Canceled'].includes(normalizedOrderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    if (!Number.isInteger(parsedProductId) || parsedProductId !== 1) {
      return res.status(400).json({ message: 'Only Bottle product is allowed' })
    }

    if (parsedReturnQty !== null && (!Number.isInteger(parsedReturnQty) || parsedReturnQty < 0)) {
      return res.status(400).json({ message: 'Return quantity must be a non-negative integer' })
    }

    if (parsedReturnQty !== null && parsedReturnQty > parsedOrderQty) {
      return res.status(400).json({ message: 'Return quantity cannot exceed quantity' })
    }

    if (parsedInvoiceNo !== null && (!Number.isInteger(parsedInvoiceNo) || parsedInvoiceNo <= 0)) {
      return res.status(400).json({ message: 'Invoice number must be a positive integer' })
    }

    await prisma.$transaction(async tx => {
      const existingOrder = await tx.orders.findFirst({
        where: { orderid: numericOrderId, isdeleted: { not: true } },
      })

      if (!existingOrder?.customerid) {
        throw new Error('ORDER_NOT_FOUND')
      }

      if (
        rest.orderno !== undefined &&
        rest.orderno !== null &&
        String(rest.orderno) !== String(existingOrder.orderno ?? '')
      ) {
        throw new Error('ORDER_NUMBER_IMMUTABLE')
      }

      const customer = await tx.customer.findFirst({
        where: { customerid: existingOrder.customerid },
      })

      if (!customer || customer.rate_per_bottle === null || customer.rate_per_bottle === undefined) {
        throw new Error('CUSTOMER_RATE_MISSING')
      }

      const lockedUnitPrice = Number(customer.rate_per_bottle)
      const computedTotalAmount = parsedOrderQty * lockedUnitPrice

      const orderData = {
        paymentmode: rest.paymentmode ?? null,
        orderstatus: normalizedOrderStatus,
        deliveryaddress: rest.deliveryaddress ?? '',
        deliverynotes: rest.deliverynotes ?? '',
        orderdate: toDateOrNull(rest.orderdate),
        invoiceno: parsedInvoiceNo,
        invoicedate: toDateOrNull(rest.invoicedate),
        telephone: rest.telephone ?? '',
        orderqty: parsedOrderQty,
        orderamount: computedTotalAmount,
        deliverydate: toDateOrNull(rest.deliverydate),
        modifydate: new Date(),
      }

      const orderUpdateResult = await tx.orders.updateMany({
        where: { orderid: numericOrderId },
        data: orderData,
      })

      if (orderUpdateResult.count === 0) {
        throw new Error('ORDER_NOT_FOUND')
      }

      const detailData = {
        productid: parsedProductId,
        unitprice: lockedUnitPrice,
        quantity: parsedOrderQty,
        returnqty: parsedReturnQty,
        bottlereturndate: toDateOrNull(bottlereturndate),
      }

      const existingDetail = await tx.order_details.findFirst({
        where: { orderid: numericOrderId },
      })

      if (existingDetail?.id) {
        await tx.order_details.update({
          where: { id: existingDetail.id },
          data: detailData,
        })
      } else {
        await tx.order_details.create({
          data: {
            orderid: numericOrderId,
            ...detailData,
          },
        })
      }
    })

    return res.status(200).json({ message: 'Order updated' })
  } catch (error: any) {
    console.error('Failed to update order:', error)
    if (error?.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (error?.message === 'CUSTOMER_RATE_MISSING') {
      return res.status(400).json({ message: 'Customer rate is missing' })
    }

    if (error?.message === 'ORDER_NUMBER_IMMUTABLE') {
      return res.status(400).json({ message: 'Order number cannot be updated' })
    }

    return res.status(500).json({ message: 'Failed to update order' })
  } finally {
    await prisma.$disconnect()
  }
}
