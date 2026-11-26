// Order, invoice, delivery and return dates are calendar days, not moments in
// time. The database columns are timestamps without a time zone, and the
// imported desktop data stores each day as midnight (2026-06-05 00:00:00).
//
// Sending a browser Date as JSON converts local midnight to UTC, so in Pakistan
// (UTC+5) "1 June" was saved as "31 May 19:00" and landed on the previous
// month's invoice. Dates therefore travel as plain "yyyy-MM-dd" strings and are
// stored as midnight of that day.

const CALENDAR_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (n: number) => String(n).padStart(2, '0')

/** Browser side: the calendar day the user picked, as "yyyy-MM-dd". */
export const toCalendarDateString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null

    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }

  if (typeof value === 'string') {
    if (CALENDAR_DAY.test(value)) return value
    // A value loaded from the API and left unchanged ("2026-06-05T00:00:00.000Z")
    // already carries its stored day in the first ten characters.
    const prefix = /^(\d{4}-\d{2}-\d{2})T/.exec(value)
    if (prefix) return prefix[1]
  }

  return null
}

/** Server side: "yyyy-MM-dd" becomes midnight of that day; anything else is
 *  parsed as before so older clients keep working. Returns null when invalid. */
export const parseCalendarDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'string') {
    const match = CALENDAR_DAY.exec(value)
    if (match) {
      const date = new Date(`${value}T00:00:00.000Z`)

      return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
    }
  }

  const date = new Date(value as string)

  return Number.isNaN(date.getTime()) ? null : date
}

// The business runs on Pakistan time. "Today" is taken there, not from the
// computer's own time-zone setting: the office PC was set to a far-west zone, so
// at 14:18 in Karachi on 25 Nov its "today" was still 24 Nov.
export const BUSINESS_TIME_ZONE = 'Asia/Karachi'

/** Today's date in Pakistan as "yyyy-MM-dd". */
export const businessToday = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)

/** Today in Pakistan as a local Date at midnight, for date pickers that work in
 *  local time (and are read back with toCalendarDateString). */
export const businessTodayDate = (now: Date = new Date()): Date => {
  const [year, month, day] = businessToday(now).split('-').map(Number)

  return new Date(year, month - 1, day)
}
