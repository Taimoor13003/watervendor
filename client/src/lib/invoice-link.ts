import { createHash, createHmac, timingSafeEqual } from 'crypto'

// A customer opens their invoice PDF from a WhatsApp message without logging
// in, so the link itself has to prove it was issued by us. It names exactly one
// customer and invoice period, expires, and carries an HMAC signature: changing
// the customer id or dates in the link breaks the signature.
const LINK_LIFETIME_DAYS = 90

// INVOICE_LINK_SECRET is preferred. Without it the key is derived from the
// database URL, which is already a server-only secret on every deployment.
const signingKey = () => {
  const secret = process.env.INVOICE_LINK_SECRET || process.env.DATABASE_URL
  if (!secret) throw new Error('No secret available to sign invoice links')

  return createHash('sha256').update(`rivielle-invoice-link|${secret}`).digest()
}

const sign = (payload: string) => createHmac('sha256', signingKey()).update(payload).digest('hex').slice(0, 32)

// invoiceNo pins the exact bill that was sent (its orders), so the link keeps
// showing that bill after it is paid or the period is reprinted. Links sent
// before it was added carry no number.
export type InvoiceLinkClaims = { customerId: number; startDate: string; endDate: string; invoiceNo?: number }

export const createInvoiceLinkToken = ({ customerId, startDate, endDate, invoiceNo }: InvoiceLinkClaims, now = Date.now()) => {
  const expires = Math.floor(now / 1000) + LINK_LIFETIME_DAYS * 24 * 60 * 60
  const payload = `${customerId}.${startDate}.${endDate}.${expires}${invoiceNo ? `.n${invoiceNo}` : ''}`

  return `${payload}.${sign(payload)}`
}

export const verifyInvoiceLinkToken = (token: unknown, now = Date.now()): InvoiceLinkClaims | null => {
  if (typeof token !== 'string') return null

  const match = /^(\d+)\.(\d{4}-\d{2}-\d{2})\.(\d{4}-\d{2}-\d{2})\.(\d+)(?:\.n(\d+))?\.([0-9a-f]{32})$/.exec(token)
  if (!match) return null

  const [, customerId, startDate, endDate, expires, invoiceNo, signature] = match
  const expected = Buffer.from(sign(`${customerId}.${startDate}.${endDate}.${expires}${invoiceNo ? `.n${invoiceNo}` : ''}`))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  if (Number(expires) * 1000 < now) return null

  const claims: InvoiceLinkClaims = { customerId: Number(customerId), startDate, endDate }
  if (invoiceNo) claims.invoiceNo = Number(invoiceNo)

  return claims
}

// The site's own address as the visitor reached it, for links and for fetching
// our public files. PUBLIC_APP_URL overrides it when set.
export const requestOrigin = (headers: Record<string, string | string[] | undefined>) => {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.replace(/\/+$/, '')

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.split(',')[0].trim()
  const host = first(headers['x-forwarded-host']) || first(headers.host)
  const proto = first(headers['x-forwarded-proto']) || (host?.startsWith('localhost') ? 'http' : 'https')

  return host ? `${proto}://${host}` : ''
}
