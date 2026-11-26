import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

// Deletes a product by marking it deleted, so it leaves the product lists and
// Inventory in Hand but old records keep their row. A product that is on any
// order is refused: those orders show its name, and every new order uses the
// Bottle product. Such a product can be switched to inactive instead.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'A valid product is required' })
  }

  try {
    const product = await prisma.products.findFirst({
      where: { id, OR: [{ isdeleted: false }, { isdeleted: null }] },
      select: { id: true, productname: true }
    })
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const orderCount = await prisma.order_details.count({ where: { productid: id } })
    if (orderCount > 0) {
      return res.status(409).json({
        message: `${product.productname || 'This product'} is on ${orderCount.toLocaleString('en-US')} order${
          orderCount === 1 ? '' : 's'
        } and cannot be deleted. Edit it and switch Active off instead.`
      })
    }

    await prisma.products.update({ where: { id }, data: { isdeleted: true } })

    return res.status(200).json({ id })
  } catch (error) {
    console.error('Failed to delete product:', error)

    return res.status(500).json({ message: 'Failed to delete product' })
  }
}
