// Every date on screen is shown day-first (dd/MM/yyyy), the way the client's
// desktop system and Pakistani users read dates. `toLocaleDateString()` followed
// the browser language instead, so an English (US) phone showed 1 July as
// "7/1/2026" — easily read as 7 January.
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy'

const pad = (n: number) => String(n).padStart(2, '0')

export const formatDisplayDate = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined || value === '') return fallback

  // Stored days arrive as "2026-07-01" or "2026-07-01T00:00:00.000Z": read the
  // day straight from the text so no time zone can move it.
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return `${match[3]}/${match[2]}/${match[1]}`
  }

  const date = value instanceof Date ? value : new Date(value as string)
  if (Number.isNaN(date.getTime())) return fallback

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}
