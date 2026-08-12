import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { accountcode, vouchertype, voucherperiodfrom, voucherperiodto } = req.query

  try {
    if (
      typeof accountcode !== 'string' ||
      !accountcode ||
      (vouchertype !== undefined && typeof vouchertype !== 'string') ||
      typeof voucherperiodfrom !== 'string' ||
      typeof voucherperiodto !== 'string'
    ) {
      return res.status(400).json({ error: 'Account and valid report dates are required' })
    }

    const from = new Date(`${voucherperiodfrom}T00:00:00Z`)
    const toExclusive = new Date(`${voucherperiodto}T00:00:00Z`)
    toExclusive.setUTCDate(toExclusive.getUTCDate() + 1)
    const type = vouchertype ? Number(vouchertype) : null
    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(toExclusive.getTime()) ||
      from >= toExclusive ||
      (type !== null && !Number.isInteger(type))
    ) {
      return res.status(400).json({ error: 'Invalid report period or voucher type' })
    }

    const [accountRows, openingRows, result] = await Promise.all([
      prisma.$queryRaw<Array<{ openingbalance: number }>>`
        SELECT COALESCE(openingbalance, 0)::int AS "openingbalance"
        FROM accounts_head
        WHERE accountcode = ${accountcode}
          AND COALESCE(isdeleted, false) = false
        ORDER BY id DESC
        LIMIT 1
      `,
      prisma.$queryRaw<Array<{ openingbalance: number }>>`
        SELECT COALESCE(SUM(COALESCE(vt.debitamount, 0) - COALESCE(vt.creditamount, 0)), 0)::int AS "openingbalance"
        FROM voucher_trans vt
        JOIN vouchers v ON v.voucherno = vt.voucherno
        WHERE vt.accountcode = ${accountcode}
          AND v.voucherdate < ${from}
          AND COALESCE(v.isdeleted, false) = false
      `,
      prisma.$queryRaw`
        SELECT vt.id, vt.voucherno, vt.accountcode, COALESCE(vt.debitamount, 0)::int AS debitamount,
               COALESCE(vt.creditamount, 0)::int AS creditamount, v.voucherdate, v.vouchertype, v.description
        FROM voucher_trans vt
        JOIN vouchers v ON v.voucherno = vt.voucherno
        WHERE vt.accountcode = ${accountcode}
          AND v.voucherdate >= ${from}
          AND v.voucherdate < ${toExclusive}
          AND COALESCE(v.isdeleted, false) = false
          AND (${type}::int IS NULL OR v.vouchertype = ${type})
        ORDER BY v.voucherdate ASC, vt.id ASC
      `
    ])

    const openingBalance = (accountRows[0]?.openingbalance || 0) + (openingRows[0]?.openingbalance || 0)

    return res.status(200).json({ result, openingBalance })
  } catch (error) {
    console.error('Failed to fetch account details:', error)
    return res.status(500).json({ error: 'Failed to fetch account details' })
  }
}
