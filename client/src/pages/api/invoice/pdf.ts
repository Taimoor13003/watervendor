import type { NextApiRequest, NextApiResponse } from 'next/types'
import { jsPDF } from 'jspdf'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'
import { requireInvoiceAuth } from 'src/lib/require-invoice-auth'

type InvoiceRow = {
  customerid: number
  InvoiceDate: Date
  returnqty: number
  rate_per_bottle: number
  firstname: string | null
  lastname: string | null
  addressres: string | null
  accountno: string | null
  orderqty: number | null
  orderamount: number | null
}

const parseDate = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

const formatDate = (value: Date) => value.toISOString().slice(0, 10).split('-').reverse().join('/')
const amountFor = (row: InvoiceRow) =>
  Number(row.orderamount ?? Number(row.orderqty || 0) * Number(row.rate_per_bottle || 0))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
  if (!(await requireInvoiceAuth(req, res))) return

  const customerParam = req.query.customerids ?? req.query.customerid
  const customerIds = typeof customerParam === 'string' ? [...new Set(customerParam.split(',').map(Number))] : []
  const startDate = parseDate(req.query.startdate ?? req.query.startDate)
  const endDate = parseDate(req.query.enddate ?? req.query.endDate)

  if (
    !customerIds.length ||
    customerIds.some(id => !Number.isInteger(id) || id <= 0) ||
    !startDate ||
    !endDate ||
    startDate > endDate
  ) {
    return res.status(400).json({ error: 'Customer IDs and a valid invoice date range are required' })
  }

  try {
    const rows = await prisma.$queryRaw<InvoiceRow[]>`
      SELECT o.customerid, o.invoicedate AS "InvoiceDate", COALESCE(od.returnqty, 0) AS "returnqty",
             COALESCE(od.unitprice, CASE WHEN o.orderqty > 0 THEN o.orderamount / o.orderqty ELSE NULL END, c.rate_per_bottle) AS "rate_per_bottle",
             c.firstname, c.lastname, c.addressres, c.accountno, o.orderqty, o.orderamount
      FROM orders o
      LEFT JOIN customer c ON c.customerid = o.customerid
      LEFT JOIN LATERAL (
        SELECT returnqty, unitprice FROM order_details WHERE orderid = o.orderid ORDER BY id DESC LIMIT 1
      ) od ON true
      WHERE o.customerid IN (${Prisma.join(customerIds)})
        AND o.invoicedate >= ${startDate}::date
        AND o.invoicedate < (${endDate}::date + INTERVAL '1 day')
        AND COALESCE(o.isdeleted, false) = false
        AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
      ORDER BY o.customerid, o.invoicedate, o.orderid
    `

    if (!rows.length) return res.status(404).json({ error: 'No invoiceable orders found' })

    const grouped = rows.reduce<Record<number, InvoiceRow[]>>((result, row) => {
      ;(result[row.customerid] ||= []).push(row)

      return result
    }, {})
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 14

    Object.values(grouped).forEach((invoiceRows, invoiceIndex) => {
      if (invoiceIndex > 0) pdf.addPage()
      const first = invoiceRows[0]
      let y = 18
      pdf.setFontSize(18)
      pdf.text('WATER VENDOR', margin, y)
      pdf.setFontSize(10)
      y += 8
      pdf.text('INVOICE DETAILS', margin, y)
      y += 7
      pdf.text(`Customer: ${[first.firstname, first.lastname].filter(Boolean).join(' ')}`, margin, y)
      y += 5
      pdf.text(
        `Account: ${first.accountno || '-'}   Period: ${formatDate(new Date(`${startDate}T00:00:00Z`))} - ${formatDate(
          new Date(`${endDate}T00:00:00Z`)
        )}`,
        margin,
        y
      )
      y += 5
      pdf.text(`Address: ${first.addressres || '-'}`, margin, y, { maxWidth: pageWidth - margin * 2 })
      y += 10
      pdf.setFontSize(9)
      pdf.text('Date', margin, y)
      pdf.text('Delivered', 55, y)
      pdf.text('Returned', 85, y)
      pdf.text('Rate', 115, y)
      pdf.text('Total', 150, y)
      y += 3
      pdf.line(margin, y, pageWidth - margin, y)
      y += 5
      let totalDelivered = 0
      let totalReturned = 0
      let totalAmount = 0
      invoiceRows.forEach(row => {
        if (y > 270) {
          pdf.addPage()
          y = 18
        }
        const amount = amountFor(row)
        totalDelivered += Number(row.orderqty || 0)
        totalReturned += Number(row.returnqty || 0)
        totalAmount += amount
        pdf.text(formatDate(new Date(row.InvoiceDate)), margin, y)
        pdf.text(String(row.orderqty || 0), 55, y)
        pdf.text(String(row.returnqty || 0), 85, y)
        pdf.text(Number(row.rate_per_bottle || 0).toFixed(2), 115, y)
        pdf.text(amount.toFixed(2), 150, y)
        y += 6
      })
      pdf.line(margin, y, pageWidth - margin, y)
      y += 6
      pdf.setFontSize(10)
      pdf.text(
        `TOTAL: Delivered ${totalDelivered}   Returned ${totalReturned}   Amount Rs ${totalAmount.toFixed(2)}`,
        margin,
        y
      )
    })

    const pdfBytes = Buffer.from(pdf.output('arraybuffer'))
    const filename =
      Object.keys(grouped).length === 1 ? `Invoice_${rows[0].accountno || rows[0].customerid}.pdf` : 'Invoices.pdf'
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBytes.length)

    return res.status(200).send(pdfBytes)
  } catch (error) {
    console.error('Invoice PDF generation failed', error)

    return res.status(500).json({ error: 'Failed to generate invoice PDF' })
  }
}
