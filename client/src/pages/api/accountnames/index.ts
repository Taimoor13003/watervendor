// this api will be used to give account code and account name for dropdown
import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  try {
    const accounts = await prisma.$queryRaw`
      SELECT DISTINCT ON (accountcode) accountcode, accountname
      FROM accounts_head
      WHERE accountcode IS NOT NULL
        AND COALESCE(isdeleted, false) = false
      ORDER BY accountcode, id DESC
    `

    res.status(200).json({ accounts })
  } catch (error) {
    console.error('Error fetching account names:', error)
    res.status(500).json({ error: 'Failed to fetch account names' })
  }
}
