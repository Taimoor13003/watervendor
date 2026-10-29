import type { NextApiRequest, NextApiResponse } from 'next/types'
import { requestOrigin, verifyInvoiceLinkToken } from 'src/lib/invoice-link'
import { buildInvoicePdf, loadSentInvoiceRows } from 'src/lib/invoice-pdf'

// The invoice PDF a customer opens from the WhatsApp message. There is no login
// here: the signed, expiring token in the link is the permission, and it covers
// exactly one customer and period (see src/lib/invoice-link.ts).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const claims = verifyInvoiceLinkToken(req.query.t)
  if (!claims) {
    return res
      .status(404)
      .send('This invoice link is not valid or has expired. Please ask Rivielle for a new one.')
  }

  try {
    // The bill as it was sent, still readable (marked PAID) after the customer pays.
    const rows = await loadSentInvoiceRows(claims.customerId, claims.startDate, claims.endDate, claims.invoiceNo)
    if (!rows.length) return res.status(404).send('Nothing is outstanding on this invoice any more. Thank you.')

    const { bytes: pdfBytes, fileName } = await buildInvoicePdf(rows, claims.startDate, claims.endDate, requestOrigin(req.headers))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`)
    res.setHeader('Content-Length', pdfBytes.length)
    res.setHeader('Cache-Control', 'private, no-store')
    res.setHeader('X-Robots-Tag', 'noindex')

    return res.status(200).send(pdfBytes)
  } catch (error) {
    console.error('Shared invoice PDF failed', error)

    return res.status(500).send('The invoice could not be generated. Please try again later.')
  }
}
