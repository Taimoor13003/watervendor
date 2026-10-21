import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireInvoiceAuth } from 'src/lib/require-invoice-auth'
import { issueInvoiceNumber } from 'src/lib/invoice-numbering'
import { buildInvoiceWhatsAppMessage, buildWhatsAppLink, normalizeWhatsAppNumber } from 'src/lib/whatsapp'
import { createInvoiceLinkToken, requestOrigin } from 'src/lib/invoice-link'

const parseCalendarDate = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

// Builds the WhatsApp message for one customer's bill. The totals are read back
// from the same data the printed invoice uses so the message can never disagree
// with the document it refers to.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireInvoiceAuth(req, res))) return

  const customerId = Number(req.query.customerid)
  const rangeStart = parseCalendarDate(req.query.startdate)
  const rangeEnd = parseCalendarDate(req.query.enddate)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return res.status(400).json({ error: 'A valid customer is required' })
  }

  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return res.status(400).json({ error: 'A valid invoice date range is required' })
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{
        orderid: number
        orderqty: number | null
        orderamount: number | null
        returnqty: number | null
        rate_per_bottle: number | null
        firstname: string | null
        middlename: string | null
        lastname: string | null
        accountno: string | null
        telephoneres: string | null
        telephoneoffice: string | null
        ordertelephone: string | null
      }>
    >`
      SELECT o.orderid, o.orderqty, o.orderamount, COALESCE(od.returnqty, 0) AS "returnqty",
             COALESCE(od.unitprice, c.rate_per_bottle) AS "rate_per_bottle",
             c.firstname, c.middlename, c.lastname, c.accountno,
             c.telephoneres, c.telephoneoffice, o.telephone AS "ordertelephone"
      FROM orders o
      LEFT JOIN customer c ON c.customerid = o.customerid
      LEFT JOIN LATERAL (
        -- Sum every detail line: a few orders carry more than one, and taking
        -- only the newest under-reported the returned bottles.
        SELECT SUM(COALESCE(d.returnqty, 0))::int AS returnqty,
               (ARRAY_AGG(d.unitprice ORDER BY d.id DESC))[1] AS unitprice
        FROM order_details d WHERE d.orderid = o.orderid
      ) od ON true
      WHERE o.customerid = ${customerId}
        AND o.invoicedate >= ${rangeStart}::date
        AND o.invoicedate < (${rangeEnd}::date + INTERVAL '1 day')
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
        -- Paid orders never appear on an invoice again (the desktop RMS rule).
        AND COALESCE(o.ispaymentreceived, false) = false
      ORDER BY o.invoicedate ASC, o.orderid ASC
    `

    if (!rows.length) {
      return res.status(404).json({ error: 'This customer has no unpaid orders in the selected date range.' })
    }

    const first = rows[0]
    const customerName = [first.firstname, first.middlename, first.lastname].filter(Boolean).join(' ') || null

    const bottlesDelivered = rows.reduce((sum, row) => sum + (row.orderqty || 0), 0)
    const bottlesReturned = rows.reduce((sum, row) => sum + (row.returnqty || 0), 0)
    const totalAmount = rows.reduce((sum, row) => {
      if (row.orderamount !== null && row.orderamount !== undefined) return sum + Number(row.orderamount)

      return sum + Number(row.orderqty || 0) * Number(row.rate_per_bottle || 0)
    }, 0)

    // The customer's "WhatsApp Number" field (telephoneoffice) is the one the
    // client wants invoices sent to. Other saved numbers are only a fallback,
    // and only when they are a real mobile number (landlines have no WhatsApp).
    const candidates = [first.telephoneoffice, first.telephoneres, first.ordertelephone].filter(
      (value): value is string => Boolean(value && value.trim())
    )
    const rawNumber = candidates.find(value => normalizeWhatsAppNumber(value)) || candidates[0] || null
    const whatsappNumber = normalizeWhatsAppNumber(rawNumber)

    // A private, expiring link to this customer's PDF for this period only.
    const origin = requestOrigin(req.headers)
    const pdfUrl = origin
      ? `${origin}/api/invoice/share?t=${createInvoiceLinkToken({ customerId, startDate: rangeStart, endDate: rangeEnd })}`
      : null

    const message = buildInvoiceWhatsAppMessage({
      customerName,
      accountNo: first.accountno,
      invoiceNumber: await issueInvoiceNumber({
        customerId,
        startDate: rangeStart,
        endDate: rangeEnd,
        orderIds: rows.map(row => row.orderid)
      }),
      periodFrom: formatDisplayDate(rangeStart),
      periodTo: formatDisplayDate(rangeEnd),
      bottlesDelivered,
      bottlesReturned,
      totalAmount,
      pdfUrl
    })

    return res.status(200).json({
      customerName,
      accountNo: first.accountno,
      storedNumber: rawNumber,
      whatsappNumber,
      message,
      pdfUrl,
      link: whatsappNumber ? buildWhatsAppLink(whatsappNumber, message) : null
    })
  } catch (error) {
    console.error('Failed to prepare the WhatsApp invoice message:', error)

    return res.status(500).json({ error: 'Failed to prepare the WhatsApp message' })
  }
}
