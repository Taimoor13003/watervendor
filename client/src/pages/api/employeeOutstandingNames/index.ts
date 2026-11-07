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
    // One entry per empid (newest row), matching the delivered-by name the
    // reports show.
    const employees = await prisma.$queryRaw`
      SELECT empid, employeecode, firstname, lastname
      FROM (
        SELECT DISTINCT ON (empid) empid, employeecode, firstname, lastname
        FROM employee_personal
        WHERE empid IS NOT NULL
        ORDER BY empid, id DESC
      ) e
      ORDER BY firstname ASC NULLS LAST, lastname ASC NULLS LAST
    `

    return res.status(200).json({ employees })
  } catch (error) {
    console.error('Error fetching employee names:', error)

    return res.status(500).json({ error: 'Internal server error' })
  }
}
