// src/pages/api/post_customer/index.ts
import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const body = req.body

    const newCustomer = await prisma.$transaction(async (tx) => {
      // 1) aggregate both customerid and accountno suffix
      const { _max } = await tx.customer.aggregate({
        _max: {
          customerid: true,
          accountno: true
        }
      })

      const maxCid = _max.customerid ?? 0
      const rawAcc = _max.accountno ?? ''
      const currentNum = rawAcc.split('-', 2)[1]
      const nextNum = currentNum
        ? parseInt(currentNum, 10) + 1
        : 1
      const nextAccNo = `RC-${String(nextNum).padStart(3, '0')}`

      // 2) create with proper type coercion
      return tx.customer.create({
        data: {
          customerid: maxCid + 1,
          firstname:     body.firstname   || null,
          middlename:    body.middlename  || null,
          lastname:      body.lastname    || null,
          customertype:  body.customertype|| null,
          accountno:     nextAccNo,
          dateofbirth:   body.dateofbirth   ? new Date(body.dateofbirth) : null,
          addressres:    body.addressres    || null,
          areares:       body.areares       || null,
          telephoneres:  body.telephoneres  || null,
          addressoffice: body.addressoffice || null,
          areaoffice:    body.areaoffice    || null,
          telephoneoffice: body.telephoneoffice || null,
          telephoneext:    body.telephoneext    || null,
          fax:           body.fax           || null,
          email:         body.email         || null,
          datefirstcontacted: body.datefirstcontacted
                              ? new Date(body.datefirstcontacted)
                              : null,
          paymentmode:   body.paymentmode   || null,
          deliverydate:  body.deliverydate  ? new Date(body.deliverydate) : null,
          deliveryarea:  body.deliveryarea  || null,
          reqbottles:    body.reqbottles    ? parseInt(body.reqbottles, 10) : null,
          requirement:   body.requirement   || null,
          notes:         body.notes         || null,
          depositamount: body.depositamount ? parseInt(body.depositamount, 10) : null,
          isdepositvoucherdone:
            typeof body.isdepositvoucherdone === 'boolean'
              ? body.isdepositvoucherdone
              : false,
          rate_per_bottle:
            body.rate_per_bottle ? parseInt(body.rate_per_bottle, 10) : null,
          delivery_person:
            body.delivery_person ? parseInt(body.delivery_person, 10) : null,
          istaxable:
            typeof body.istaxable === 'boolean'
              ? body.istaxable
              : false,
          // gender:       body.gender       || null,
          // tax:          body.tax          ? parseInt(body.tax, 10) : null,
        }
      })
    })

    return res.status(201).json(newCustomer)
  } catch (error) {
    console.error('Failed to create customer:', error)
    return res.status(500).json({ error: 'Unable to create customer' })
  } finally {
    await prisma.$disconnect()
  }
}
