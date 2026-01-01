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
    const { accountcode, accounttype, accountname, openingbalance, remarks } = req.body || {}

    if (!accountcode || !accounttype || !accountname) {
      return res.status(400).json({ message: 'accountcode, accounttype, and accountname are required' })
    }

    const typeAsNumber = toNumberOrNull(accounttype);

    // derive next accountid (since existing rows use manual ids)
    const max = await prisma.accounts_head.aggregate({
      _max: { accountid: true },
    });
    const nextAccountId = (max._max.accountid ?? 0) + 1;

    const payload = {
      accountid: nextAccountId,
      accountcode: String(accountcode).trim(),
      accounttype: typeAsNumber ?? null,
      accountname: String(accountname).trim(),
      openingbalance: toNumberOrNull(openingbalance),
      remarks: remarks ?? '',
    }

    const created = await prisma.accounts_head.create({ data: payload })

    return res.status(201).json(created)
  } catch (error: any) {
    console.error('Failed to create account:', error)
    return res.status(500).json({ message: 'Failed to create account' })
  } finally {
    await prisma.$disconnect()
  }
}
