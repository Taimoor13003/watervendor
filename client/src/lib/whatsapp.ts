// Customer numbers are stored the way staff typed them ("0321-243-7500",
// "0300-9257897", "111-742-737"). WhatsApp needs digits in international form,
// so local Pakistani mobile numbers are converted and anything unrecognised is
// handed back for a human to correct rather than guessed at.
export const PAKISTAN_COUNTRY_CODE = '92'

export const normalizeWhatsAppNumber = (raw?: string | null): string | null => {
  if (!raw) return null

  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return null

  // Already international, with or without a leading 00.
  if (digits.startsWith('0092')) return digits.slice(2)
  if (digits.startsWith(PAKISTAN_COUNTRY_CODE) && digits.length === 12) return digits

  // Local mobile: 03XXXXXXXXX -> 923XXXXXXXXX
  if (/^03\d{9}$/.test(digits)) return `${PAKISTAN_COUNTRY_CODE}${digits.slice(1)}`

  // Mobile written without the trunk zero: 3XXXXXXXXX
  if (/^3\d{9}$/.test(digits)) return `${PAKISTAN_COUNTRY_CODE}${digits}`

  // Landlines and UAN numbers have no reliable WhatsApp form.
  return null
}

export const buildWhatsAppLink = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`

// On a computer the client works in a logged-in WhatsApp Web tab; wa.me would
// stop on a "continue to chat" page first, so go straight to WhatsApp Web there.
export const buildWhatsAppWebLink = (number: string, message: string) =>
  `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`

// Browser only. Phones open the WhatsApp app; computers reuse one WhatsApp Web
// tab, so sending a run of bills does not pile up a tab per customer. Must be
// called straight from a click, or the browser blocks the new tab.
export const openWhatsAppChat = (number: string, message: string) => {
  const isPhone = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  if (isPhone) {
    window.open(buildWhatsAppLink(number, message), '_blank', 'noopener,noreferrer')
  } else {
    window.open(buildWhatsAppWebLink(number, message), 'rivielle-whatsapp')
  }
}

export type InvoiceMessageInput = {
  customerName?: string | null
  accountNo?: string | null
  invoiceNumber: string
  periodFrom: string
  periodTo: string
  bottlesDelivered: number
  bottlesReturned: number
  totalAmount: number
  pdfUrl?: string | null
}

export const buildInvoiceWhatsAppMessage = ({
  customerName,
  accountNo,
  invoiceNumber,
  periodFrom,
  periodTo,
  bottlesDelivered,
  bottlesReturned,
  totalAmount,
  pdfUrl
}: InvoiceMessageInput) => {
  const greeting = customerName ? `Dear ${customerName},` : 'Dear customer,'

  return [
    greeting,
    '',
    `Please find your water bill for ${periodFrom} to ${periodTo}.`,
    '',
    `Invoice No: ${invoiceNumber}`,
    accountNo ? `Account No: ${accountNo}` : null,
    `Bottles delivered: ${bottlesDelivered}`,
    `Bottles returned: ${bottlesReturned}`,
    `Total amount due: Rs ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pdfUrl ? '' : null,
    pdfUrl ? `Download your invoice (PDF): ${pdfUrl}` : null,
    '',
    'Thank you for your business.',
    'Rivielle - The Premium Drinking Water'
  ]
    .filter(line => line !== null)
    .join('\n')
}
