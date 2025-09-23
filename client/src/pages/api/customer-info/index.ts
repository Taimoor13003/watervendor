import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id) return res.status(400).json({ message: 'Customer ID is required' })

    const customer = await prisma.customer.findFirst({
      where: {
        customerid: Number(id)     // ✅ This is now allowed in `findFirst`
      },
      select: {
        paymentmode: true,
        addressres: true,
        rate_per_bottle: true,
      }
    })

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    res.status(200).json(customer)
  } catch (error: any) {
    console.error('Failed to fetch customer info:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
