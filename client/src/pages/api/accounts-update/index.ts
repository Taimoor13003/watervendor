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
    const { id, accountid, accountcode, accounttype, accountname, openingbalance, remarks } = req.body || {}

    const idNumber = toNumberOrNull(id);
    const accountIdNumber = toNumberOrNull(accountid);

    if (idNumber === null) {
      return res.status(400).json({ message: 'Missing account id' });
    }
    if (!accountcode || accounttype === undefined || !accountname) {
      return res.status(400).json({ message: 'accountcode, accounttype, and accountname are required' });
    }

    const payload = {
      accountcode: String(accountcode).trim(),
      accounttype: toNumberOrNull(accounttype),
      accountname: String(accountname).trim(),
      openingbalance: toNumberOrNull(openingbalance),
      remarks: remarks?.toString().trim() ?? '',
    };

    const updated = await prisma.accounts_head.updateMany({
      where: { id: idNumber },
      data: payload,
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const row = await prisma.accounts_head.findFirst({ where: { id: idNumber } });
    return res.status(200).json({ message: 'Account updated', count: updated.count, account: row, accountIdNumber });
  } catch (error: any) {
    console.error('Failed to update account:', error);
    return res.status(500).json({ message: 'Failed to update account' });
  } finally {
    await prisma.$disconnect();
  }
}

