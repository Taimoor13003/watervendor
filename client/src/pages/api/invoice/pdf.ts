import type { NextApiRequest, NextApiResponse } from 'next/types'
import { requireInvoiceAuth } from 'src/lib/require-invoice-auth'
import { requestOrigin } from 'src/lib/invoice-link'
import { buildInvoicePdf, invoiceFileName, loadInvoiceRows } from 'src/lib/invoice-pdf'

const parseDate = (value: unknown) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value
}

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
    const rows = await loadInvoiceRows(customerIds, startDate, endDate)
    if (!rows.length) return res.status(404).json({ error: 'No invoiceable orders found' })

    const pdfBytes = await buildInvoicePdf(rows, startDate, endDate, requestOrigin(req.headers))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceFileName(rows, startDate, endDate)}"`)
    res.setHeader('Content-Length', pdfBytes.length)

    return res.status(200).send(pdfBytes)
  } catch (error) {
    console.error('Invoice PDF generation failed', error)

    return res.status(500).json({ error: 'Failed to generate invoice PDF' })
  }
}
