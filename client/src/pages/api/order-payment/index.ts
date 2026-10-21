import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

// Payment Received for ONE order, as in the desktop RMS Edit Order screen. A
// paid order leaves accounts receivable and never appears on an invoice again;
// "received: false" undoes a mistaken entry.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const source = req.method === 'GET' ? req.query : req.body ?? {}
  const orderId = Number(source.orderid)
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'A valid order is required' })
  }

  try {
    const order = await prisma.orders.findFirst({
      where: { orderid: orderId, OR: [{ isdeleted: false }, { isdeleted: null }] },
      select: { id: true, orderno: true, ispaymentreceived: true, orderstatus: true }
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (req.method === 'GET') {
      return res.status(200).json({ orderno: order.orderno, received: Boolean(order.ispaymentreceived) })
    }

    if (typeof source.received !== 'boolean') {
      return res.status(400).json({ error: 'received must be true or false' })
    }
    if (source.received && ['Cancel', 'Canceled'].includes(String(order.orderstatus || ''))) {
      return res.status(400).json({ error: 'A cancelled order cannot be marked as paid' })
    }

    await prisma.orders.update({
      where: { id: order.id },
      data: { ispaymentreceived: source.received, modifydate: new Date() }
    })

    return res.status(200).json({ orderno: order.orderno, received: source.received })
  } catch (error) {
    console.error('Failed to update order payment:', error)

    return res.status(500).json({ error: 'Failed to update the payment' })
  }
}
