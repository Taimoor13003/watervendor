// A customer invoice covers one customer over one invoice period, so the account
// number plus that period identifies it uniquely. Deriving the number this way
// keeps it stable: reprinting the same invoice always shows the same number.
const compactDate = (value?: string | null) => {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  if (match) return `${match[1]}${match[2]}${match[3]}`

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

export const buildInvoiceNumber = ({
  accountNo,
  customerId,
  startDate,
  endDate
}: {
  accountNo?: string | number | null
  customerId?: string | number | null
  startDate?: string | null
  endDate?: string | null
}) => {
  const account = String(accountNo ?? customerId ?? '').trim() || 'NA'
  const from = compactDate(startDate)
  const to = compactDate(endDate)
  const period = [from, to].filter(Boolean).join('-')

  return period ? `INV-${account}-${period}` : `INV-${account}`
}

export default buildInvoiceNumber
