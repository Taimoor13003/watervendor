import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { vouchertypes } from 'src/constant'

const toNumberOrNull = (value: any) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

const toDateOrNull = (value: any) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const {
      voucherid,
      voucherno,
      description,
      vouchertype,
      voucherdate,
      voucheramount,
      accountcode,
      chqno,
      debitamount,
      creditamount,
    } = req.body

    if (!voucherid || !voucherno) {
      return res.status(400).json({ message: 'Voucher id and number are required' })
    }

    const parsedDate = toDateOrNull(voucherdate)
    if (!parsedDate) {
      return res.status(400).json({ message: 'Invalid voucher date' })
    }

    const typeMap = new Map(vouchertypes.map(t => [t.name.toLowerCase(), t.id]))
    const typeId = typeof vouchertype === 'number'
      ? vouchertype
      : typeMap.get(String(vouchertype).toLowerCase()) ?? null

    const debit = toNumberOrNull(debitamount) ?? 0
    const credit = toNumberOrNull(creditamount) ?? 0
    const amount = toNumberOrNull(voucheramount) ?? Math.max(debit, credit)

    await prisma.vouchers.update({
      where: { id: Number(voucherid) },
      data: {
        description: description ?? '',
        vouchertype: typeId,
        voucherdate: parsedDate,
        voucheramount: amount,
        modifydate: new Date(),
      },
    })

    await prisma.voucher_trans.updateMany({
      where: { voucherno: Number(voucherno) },
      data: {
        accountcode: accountcode ?? '',
        chqno: chqno ?? '',
        debitamount: debit,
        creditamount: credit,
      },
    })

    return res.status(200).json({ message: 'Voucher updated' })
  } catch (error: any) {
    console.error('Failed to update voucher:', error)
    return res.status(500).json({ message: 'Failed to update voucher' })
  } finally {
    await prisma.$disconnect()
  }
}
