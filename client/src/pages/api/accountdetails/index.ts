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

    // Matches the desktop RMS "Accounts Details" report: only the vouchers posted
    // to the account inside the period, with their debit/credit totals. It does
    // not carry an opening balance in from earlier years, which on an expense
    // account like Plant Supplies added up to tens of lakhs of old spending.
    const result = await prisma.$queryRaw`
      SELECT vt.id, vt.voucherno, vt.accountcode, vt.chqno, COALESCE(vt.debitamount, 0)::int AS debitamount,
             COALESCE(vt.creditamount, 0)::int AS creditamount, v.voucherdate, v.vouchertype, v.description
      FROM voucher_trans vt
      JOIN vouchers v ON v.voucherno = vt.voucherno
      WHERE vt.accountcode = ${accountcode}
        AND v.voucherdate >= ${voucherperiodfrom}::date
        AND v.voucherdate < (${voucherperiodto}::date + INTERVAL '1 day')
        AND COALESCE(v.isdeleted, false) = false
        AND (${type}::int IS NULL OR v.vouchertype = ${type})
      ORDER BY v.voucherdate ASC, vt.id ASC
    `

    return res.status(200).json({ result })
  } catch (error) {
    console.error('Failed to fetch account details:', error)
    return res.status(500).json({ error: 'Failed to fetch account details' })
  }
}
