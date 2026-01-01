import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { id } = req.query
  const numericId = Number(id)
  if (!id || Number.isNaN(numericId)) {
    return res.status(400).json({ message: 'Missing account id' })
  }

  try {
    const updated = await prisma.accounts_head.update({
      where: { id: numericId },
      data: { isdeleted: true },
    })

    return res.status(200).json({ message: 'Account deleted', account: updated })
  } catch (error: any) {
    console.error('Failed to delete account:', error)
    return res.status(500).json({ message: 'Failed to delete account' })
  } finally {
    await prisma.$disconnect()
  }
}
