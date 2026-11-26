import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

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

  if (!(await requireApiAuth(req, res))) return

  try {
    const { id, productcode, productname, unitsinstock, totalunits, rateperunitcash, remarks, isactive } = req.body || {}

    const idNumber = toNumberOrNull(id)
    if (idNumber === null) {
      return res.status(400).json({ message: 'Missing product id' })
    }
    if (!productcode || !productname || rateperunitcash === undefined) {
      return res.status(400).json({ message: 'productcode, productname, rateperunitcash are required' })
    }

    const payload = {
      productcode: String(productcode).trim(),
      productname: String(productname).trim(),
      unitsinstock: toNumberOrNull(unitsinstock),
      totalunits: toNumberOrNull(totalunits),
      rateperunitcash: toNumberOrNull(rateperunitcash),
      remarks: remarks?.toString().trim() ?? '',
      isactive: typeof isactive === 'boolean' ? isactive : true,
    }

    // Rates and stock are whole-number columns; a decimal used to crash the save.
    for (const field of ['unitsinstock', 'totalunits', 'rateperunitcash'] as const) {
      const value = payload[field]
      if (value !== null && !Number.isInteger(value)) {
        return res.status(400).json({ message: `${field} must be a whole number` })
      }
      if (value !== null && value < 0) {
        return res.status(400).json({ message: `${field} cannot be negative` })
      }
    }
    if (payload.rateperunitcash === null) {
      return res.status(400).json({ message: 'Cash rate is required' })
    }
    if (!payload.productcode || !payload.productname) {
      return res.status(400).json({ message: 'Product code and name are required' })
    }
    if (payload.productcode.length > 50 || payload.productname.length > 50) {
      return res.status(400).json({ message: 'Product code and name can be at most 50 characters' })
    }

    // Two live products with one code would be impossible to tell apart.
    const sameCode = await prisma.products.findFirst({
      where: {
        productcode: { equals: payload.productcode, mode: 'insensitive' },
        OR: [{ isdeleted: false }, { isdeleted: null }],
        NOT: { id: idNumber }
      },
      select: { id: true }
    })
    if (sameCode) {
      return res.status(409).json({ message: `Another product already uses the code ${payload.productcode}` })
    }

    // A deleted product is gone from every list and cannot be saved again.
    const updated = await prisma.products.updateMany({
      where: { id: idNumber, OR: [{ isdeleted: false }, { isdeleted: null }] },
      data: payload
    })
    if (updated.count === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const row = await prisma.products.findFirst({ where: { id: idNumber } })
    return res.status(200).json({ message: 'Product updated', count: updated.count, product: row })
  } catch (error: any) {
    console.error('Failed to update product:', error)
    return res.status(500).json({ message: 'Failed to update product' })
  }
}
