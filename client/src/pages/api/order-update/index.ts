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
    const { orderid, productid, unitprice, returnqty, bottlereturndate, ...rest } = req.body
    const numericOrderId = Number(orderid)

    if (Number.isNaN(numericOrderId)) {
      return res.status(400).json({ message: 'Order ID is required' })
    }

    const orderData = {
      paymentmode: rest.paymentmode ?? null,
      orderstatus: rest.orderstatus ?? null,
      deliveryaddress: rest.deliveryaddress ?? '',
      deliverynotes: rest.deliverynotes ?? '',
      invoiceno: toNumberOrNull(rest.invoiceno),
      invoicedate: toDateOrNull(rest.invoicedate),
      telephone: rest.telephone ?? '',
      orderqty: toNumberOrNull(rest.orderqty),
      orderamount: toNumberOrNull(rest.orderamount),
      deliverydate: toDateOrNull(rest.deliverydate),
      modifydate: new Date(),
    }

    await prisma.orders.updateMany({ where: { orderid: numericOrderId }, data: orderData })

    const detailData = {
      productid: toNumberOrNull(productid),
      unitprice: toNumberOrNull(unitprice),
      returnqty: toNumberOrNull(returnqty),
      bottlereturndate: toDateOrNull(bottlereturndate),
    }

    // Only attempt detail update if we have an orderid
    if (!Number.isNaN(numericOrderId)) {
      await prisma.order_details.updateMany({ where: { orderid: numericOrderId }, data: detailData })
    }

    return res.status(200).json({ message: 'Order updated' })
  } catch (error: any) {
    console.error('Failed to update order:', error)
    return res.status(500).json({ message: 'Failed to update order' })
  } finally {
    await prisma.$disconnect()
  }
}
