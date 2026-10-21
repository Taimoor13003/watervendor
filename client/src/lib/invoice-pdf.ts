import { promises as fs } from 'fs'
import path from 'path'
import { jsPDF } from 'jspdf'
import { Prisma } from '@prisma/client'
import prisma from 'src/lib/prisma'
import { issueInvoiceNumbers } from 'src/lib/invoice-numbering'

// One PDF for both the in-app Download button and the link sent to customers on
// WhatsApp, laid out like the printed invoice (and the desktop RMS invoice).

export type InvoiceRow = {
  customerid: number
  orderid: number
  InvoiceDate: Date
  returnqty: number
  rate_per_bottle: number
  firstname: string | null
  lastname: string | null
  addressres: string | null
  telephoneres: string | null
  telephoneoffice: string | null
  accountno: string | null
  orderqty: number | null
  orderamount: number | null
}

export const loadInvoiceRows = (customerIds: number[], startDate: string, endDate: string) =>
  prisma.$queryRaw<InvoiceRow[]>`
    SELECT o.customerid, o.orderid, o.invoicedate AS "InvoiceDate", COALESCE(od.returnqty, 0) AS "returnqty",
           COALESCE(od.unitprice, CASE WHEN o.orderqty > 0 THEN o.orderamount / o.orderqty ELSE NULL END, c.rate_per_bottle) AS "rate_per_bottle",
           c.firstname, c.lastname, NULLIF(TRIM(BOTH E' \n\t' FROM replace(c.addressres, E'\r', '')), '') AS "addressres", c.telephoneres, c.telephoneoffice,
           c.accountno, o.orderqty, o.orderamount
    FROM orders o
    LEFT JOIN customer c ON c.customerid = o.customerid
    LEFT JOIN LATERAL (
      -- Sum every detail line: a few orders carry more than one, and taking
      -- only the newest under-reported the returned bottles.
      SELECT SUM(COALESCE(d.returnqty, 0))::int AS returnqty,
             (ARRAY_AGG(d.unitprice ORDER BY d.id DESC))[1] AS unitprice
      FROM order_details d WHERE d.orderid = o.orderid
    ) od ON true
    WHERE o.customerid IN (${Prisma.join(customerIds)})
      AND o.invoicedate >= ${startDate}::date
      AND o.invoicedate < (${endDate}::date + INTERVAL '1 day')
      AND COALESCE(o.isdeleted, false) = false
      AND COALESCE(o.orderstatus, '') NOT IN ('Cancel', 'Canceled')
      -- Paid orders never appear on an invoice again (the desktop RMS rule).
      AND COALESCE(o.ispaymentreceived, false) = false
    ORDER BY o.customerid, o.invoicedate, o.orderid
  `

const LOGOS = {
  iso: { file: 'iso-22000.jpg', ratio: 356 / 600 },
  rivielle: { file: 'rivielle.jpg', ratio: 319 / 729 },
  standards: { file: 'pakistan-standards.jpg', ratio: 299 / 600 }
}

type Logos = Partial<Record<keyof typeof LOGOS, string>>

// Logos are read from /public on disk and, where the server bundle does not
// include /public (Vercel), fetched from the site itself. A missing logo leaves
// a gap rather than failing the invoice.
const loadLogos = async (origin?: string): Promise<Logos> => {
  const entries = await Promise.all(
    (Object.keys(LOGOS) as Array<keyof typeof LOGOS>).map(async key => {
      const file = LOGOS[key].file
      try {
        const bytes = await fs.readFile(path.join(process.cwd(), 'public', 'images', 'invoice', file))

        return [key, `data:image/jpeg;base64,${bytes.toString('base64')}`] as const
      } catch {
        if (!origin) return [key, undefined] as const
        try {
          const response = await fetch(`${origin}/images/invoice/${file}`)
          if (!response.ok) return [key, undefined] as const
          const bytes = Buffer.from(await response.arrayBuffer())

          return [key, `data:image/jpeg;base64,${bytes.toString('base64')}`] as const
        } catch {
          return [key, undefined] as const
        }
      }
    })
  )

  return Object.fromEntries(entries.filter(([, value]) => value)) as Logos
}

const formatDate = (value: Date) => value.toISOString().slice(0, 10).split('-').reverse().join('/')
const amountFor = (row: InvoiceRow) =>
  Number(row.orderamount ?? Number(row.orderqty || 0) * Number(row.rate_per_bottle || 0))
const money = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// "Monday, 20 October, 2026" in Karachi time, as on the printed invoice.
const issueDate = (now = new Date()) => {
  const karachi = new Date(now.getTime() + 5 * 60 * 60 * 1000)

  return `${DAYS[karachi.getUTCDay()]}, ${String(karachi.getUTCDate()).padStart(2, '0')} ${MONTHS[karachi.getUTCMonth()]}, ${karachi.getUTCFullYear()}`
}

const FOOTER = 'Plot # C-3-28 Block-B Korangi Industrial Area, Karachi. Cell: 0300-2734089 - 0332-4422385 Ph: 021-3515-1000'

// Returns the PDF and a file name: the invoice number for one customer,
// "Invoices.pdf" for several.
export const buildInvoicePdf = async (rows: InvoiceRow[], startDate: string, endDate: string, origin?: string) => {
  const [logos, invoiceNumbers] = await Promise.all([loadLogos(origin), issueInvoiceNumbers(rows, startDate, endDate)])
  const customerCount = new Set(rows.map(row => row.customerid)).size
  const fileName = customerCount === 1 ? `${invoiceNumbers[String(rows[0].customerid)]}.pdf` : 'Invoices.pdf'
  const grouped = rows.reduce<Record<number, InvoiceRow[]>>((result, row) => {
    ;(result[row.customerid] ||= []).push(row)

    return result
  }, {})

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 14
  const right = pageWidth - margin

  // Column right edges for the numbers, like the printed table.
  const col = { date: margin + 3, delivered: 92, returned: 140, rate: 166, total: right - 3 }

  const drawFooter = () => {
    pdf.setFillColor(220, 240, 251)
    pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F')
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(0, 0, 0)
    pdf.text(FOOTER, pageWidth / 2, pageHeight - 4, { align: 'center' })
  }

  const drawTableHeader = (y: number) => {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('Invoice Date', col.date, y)
    pdf.text('Bottles Delivered', col.delivered, y, { align: 'right' })
    pdf.text('Bottles Returned', col.returned, y, { align: 'right' })
    pdf.text('Rate', col.rate, y, { align: 'right' })
    pdf.text('Total', col.total, y, { align: 'right' })
    pdf.setLineWidth(0.5)
    pdf.line(margin, y + 2, right, y + 2)

    return y + 7
  }

  Object.values(grouped).forEach((invoiceRows, invoiceIndex) => {
    if (invoiceIndex > 0) pdf.addPage()
    const first = invoiceRows[0]
    const invoiceNumber = invoiceNumbers[String(first.customerid)]
    pdf.setTextColor(0, 0, 0)

    // Header: certification marks either side of the Rivielle logo.
    if (logos.iso) pdf.addImage(logos.iso, 'JPEG', margin, 12, 34, 34 * LOGOS.iso.ratio)
    if (logos.rivielle) pdf.addImage(logos.rivielle, 'JPEG', pageWidth / 2 - 30, 8, 60, 60 * LOGOS.rivielle.ratio)
    if (logos.standards) pdf.addImage(logos.standards, 'JPEG', right - 40, 12, 40, 40 * LOGOS.standards.ratio)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('Rivielle.org', pageWidth / 2, 39, { align: 'center' })

    // Customer block.
    let y = 50
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text([first.firstname, first.lastname].filter(Boolean).join(' ') || '-', margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const addressLines = (first.addressres || '-')
      .split('\n')
      .flatMap(line => pdf.splitTextToSize(line.trim(), pageWidth - margin * 2) as string[])
    addressLines.forEach(line => {
      y += 5
      pdf.text(line, margin, y)
    })

    y += 9
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Date: ${issueDate()}`, margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    y += 5
    pdf.text(`Account #: ${first.accountno || '-'}`, margin, y)
    y += 4.5
    pdf.text(`Invoice #: ${invoiceNumber}`, margin, y)

    // Boxed title.
    y += 5
    pdf.setLineWidth(0.3)
    pdf.rect(margin, y, right - margin, 9)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)
    pdf.text('INVOICE DETAILS', pageWidth / 2, y + 6, { align: 'center', charSpace: 1.5 })
    y = drawTableHeader(y + 16)

    let totalDelivered = 0
    let totalReturned = 0
    let totalAmount = 0
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    invoiceRows.forEach(row => {
      if (y > pageHeight - 40) {
        drawFooter()
        pdf.addPage()
        y = drawTableHeader(20)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
      }
      const amount = amountFor(row)
      totalDelivered += Number(row.orderqty || 0)
      totalReturned += Number(row.returnqty || 0)
      totalAmount += amount
      pdf.text(formatDate(new Date(row.InvoiceDate)), col.date, y)
      pdf.text(String(row.orderqty || 0), col.delivered, y, { align: 'right' })
      pdf.text(String(row.returnqty || 0), col.returned, y, { align: 'right' })
      pdf.text(money(Number(row.rate_per_bottle || 0)), col.rate, y, { align: 'right' })
      pdf.text(money(amount), col.total, y, { align: 'right' })
      y += 6
    })

    // TOTAL row, ruled above and below.
    pdf.setLineWidth(0.6)
    pdf.line(margin, y - 3.5, right, y - 3.5)
    y += 2
    pdf.setFont('helvetica', 'bold')
    pdf.text('TOTAL', col.date, y)
    pdf.text(String(totalDelivered), col.delivered, y, { align: 'right' })
    pdf.text(String(totalReturned), col.returned, y, { align: 'right' })
    pdf.text(money(totalAmount), col.total, y, { align: 'right' })
    pdf.line(margin, y + 3, right, y + 3)

    // "Total amount due is Rs.3,740.00 only." with the amount in bold.
    y += 11
    pdf.setFont('helvetica', 'normal')
    const lead = 'Total amount due is Rs.'
    pdf.text(lead, margin, y)
    let x = margin + pdf.getTextWidth(lead) + 0.3
    pdf.setFont('helvetica', 'bold')
    pdf.text(money(totalAmount), x, y)
    x += pdf.getTextWidth(money(totalAmount))
    pdf.setFont('helvetica', 'normal')
    pdf.text(' only.', x, y)
    pdf.text('Thank you.', margin, y + 9)

    drawFooter()
  })

  return { bytes: Buffer.from(pdf.output('arraybuffer')), fileName }
}
