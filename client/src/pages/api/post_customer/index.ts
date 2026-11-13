// src/pages/api/post_customer/index.ts
import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

// Arbitrary but fixed key: serialises customer id / account number allocation.
const CUSTOMER_NUMBER_LOCK = 918273647

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const body = req.body || {}

    const requiredFields = ['firstname', 'lastname', 'customertype', 'paymentmode', 'requirement'] as const
    const missingField = requiredFields.find(field => !String(body[field] ?? '').trim())

    if (missingField || body.reqbottles === undefined || body.reqbottles === null || body.reqbottles === '') {
      return res.status(400).json({ error: 'First name, last name, customer type, payment mode, requirement, and bottles per visit are required' })
    }

    // Normalize numeric fallbacks to avoid NOT NULL violations in legacy schema
    const taxValue =
      body.tax === undefined || body.tax === null || body.tax === ''
        ? 0
        : parseInt(body.tax, 10)

    const reqBottlesValue =
      body.reqbottles === undefined || body.reqbottles === null || body.reqbottles === ''
        ? 0
        : parseInt(body.reqbottles, 10)

    const depositValue =
      body.depositamount === undefined || body.depositamount === null || body.depositamount === ''
        ? 0
        : parseInt(body.depositamount, 10)

    const ratePerBottleValue =
      body.rate_per_bottle === undefined || body.rate_per_bottle === null || body.rate_per_bottle === ''
        ? 0
        : parseInt(body.rate_per_bottle, 10)

    if ([taxValue, reqBottlesValue, depositValue, ratePerBottleValue].some(value => Number.isNaN(value))) {
      return res.status(400).json({ error: 'Numeric customer fields must contain valid numbers' })
    }

    if (reqBottlesValue < 0 || depositValue < 0 || ratePerBottleValue < 0 || taxValue < 0) {
      return res.status(400).json({ error: 'Numeric customer fields cannot be negative' })
    }

    const newCustomer = await prisma.$transaction(async (tx) => {
      // One allocation at a time, so two creates cannot claim the same number.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${CUSTOMER_NUMBER_LOCK})`

      const { _max } = await tx.customer.aggregate({ _max: { customerid: true } })
      const maxCid = _max.customerid ?? 0

      // Like the desktop, the account number follows the customer id: customer
      // 1947 is RC-1947. It used to come from MAX(accountno), which compares
      // text, so 'RC-987' ranked above 'RC-1946' and new customers got RC-988.
      let accountNumber = maxCid + 1
      let nextAccNo = `RC-${accountNumber}`
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const clash = await tx.customer.findFirst({ where: { accountno: nextAccNo }, select: { id: true } })
        if (!clash) break
        accountNumber += 1
        nextAccNo = `RC-${accountNumber}`
      }

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
          reqbottles:    reqBottlesValue,
          requirement:   body.requirement   || null,
          notes:         body.notes         || null,
          depositamount: depositValue,
          isdepositvoucherdone:
            typeof body.isdepositvoucherdone === 'boolean'
              ? body.isdepositvoucherdone
              : false,
          rate_per_bottle: ratePerBottleValue,
          delivery_person:
            body.delivery_person ? parseInt(body.delivery_person, 10) : null,
          istaxable:
            typeof body.istaxable === 'boolean'
              ? body.istaxable
              : false,
          gender:       body?.gender       || 'Mr',
          tax:          taxValue,
          isdeleted: false,
          modifydate: new Date(),
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
