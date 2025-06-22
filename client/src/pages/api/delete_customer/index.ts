// src/pages/api/post_customer/index.ts
import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

 try {
        // Expect { id: string|number } in query or body
        const idParam = req.query.id ?? req.body.id
        const id = typeof idParam === 'string' ? parseInt(idParam, 10) : idParam

        console.log('Deleting customer with id:', id)

        if (!id || isNaN(id)) {
          return res.status(400).json({ error: 'Invalid or missing id' })
        }
        const deleted = await prisma.customer.update({
          where: { id },
          data: { isdeleted: true }
        })
        return res.status(200).json(deleted)
      } catch (error) {
        console.error('Failed to delete customer:', error)
        return res.status(500).json({ error: 'Unable to delete customer' })
      } finally {
        await prisma.$disconnect()
      }
}
