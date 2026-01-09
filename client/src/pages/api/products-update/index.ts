import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

const toNumberOrNull = (value: any) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { id, productcode, productname, unitsinstock, totalunits, rateperunitcash, rateperunitcoupon, remarks, isactive } = req.body || {}

    const idNumber = toNumberOrNull(id)
    if (idNumber === null) {
      return res.status(400).json({ message: 'Missing product id' })
    }
    if (!productcode || !productname || rateperunitcash === undefined || rateperunitcoupon === undefined) {
      return res.status(400).json({ message: 'productcode, productname, rateperunitcash, rateperunitcoupon are required' })
    }

    const payload = {
      productcode: String(productcode).trim(),
      productname: String(productname).trim(),
      unitsinstock: toNumberOrNull(unitsinstock),
      totalunits: toNumberOrNull(totalunits),
      rateperunitcash: toNumberOrNull(rateperunitcash),
      rateperunitcoupon: toNumberOrNull(rateperunitcoupon),
      remarks: remarks?.toString().trim() ?? '',
      isactive: typeof isactive === 'boolean' ? isactive : true,
    }

    const updated = await prisma.products.updateMany({ where: { id: idNumber }, data: payload })
    if (updated.count === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const row = await prisma.products.findFirst({ where: { id: idNumber } })
    return res.status(200).json({ message: 'Product updated', count: updated.count, product: row })
  } catch (error: any) {
    console.error('Failed to update product:', error)
    return res.status(500).json({ message: 'Failed to update product' })
  } finally {
    await prisma.$disconnect()
  }
}
