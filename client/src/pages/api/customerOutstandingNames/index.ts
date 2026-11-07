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
    const customers = await prisma.$queryRaw`
      SELECT customerid, accountno, firstname, lastname
      FROM customer
      WHERE COALESCE(isdeleted, false) = false
        AND customerid IS NOT NULL
      ORDER BY firstname ASC NULLS LAST, lastname ASC NULLS LAST
    `

    return res.status(200).json({ customers })
  } catch (error) {
    console.error('Error fetching customer names:', error)

    return res.status(500).json({ error: 'Internal server error' })
  }
}
