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
    const { productcode, productname, unitsinstock, totalunits, rateperunitcash, rateperunitcoupon, remarks, isactive } = req.body || {}

    if (!productcode || !productname || rateperunitcash === undefined || rateperunitcoupon === undefined) {
      return res.status(400).json({ message: 'productcode, productname, rateperunitcash, rateperunitcoupon are required' })
    }

    // derive next productid
    const max = await prisma.products.aggregate({ _max: { productid: true } })
    const nextProductId = (max._max.productid ?? 0) + 1

    const payload = {
      productid: nextProductId,
      productcode: String(productcode).trim(),
      productname: String(productname).trim(),
      unitsinstock: toNumberOrNull(unitsinstock),
      totalunits: toNumberOrNull(totalunits),
      rateperunitcash: toNumberOrNull(rateperunitcash),
      rateperunitcoupon: toNumberOrNull(rateperunitcoupon),
      remarks: remarks?.toString().trim() ?? '',
      isactive: typeof isactive === 'boolean' ? isactive : true,
      isdeleted: false,
    }

    const created = await prisma.products.create({ data: payload })
    return res.status(201).json(created)
  } catch (error: any) {
    console.error('Failed to create product:', error)
    return res.status(500).json({ message: 'Failed to create product' })
  } finally {
    await prisma.$disconnect()
  }
}
