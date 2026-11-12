import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'
import { requireApiAuth } from 'src/lib/require-invoice-auth'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const

// "All Months" runs the statement for the whole year, like the desktop option.
const ALL_MONTHS = 'All Months'

type Amount = bigint | number | null
type MonthRow = { month: number; income: Amount; expenses: Amount }
type AccountRow = { kind: 'income' | 'expense'; accountcode: string | null; accountname: string | null; amount: Amount }

const toNumber = (value: Amount | undefined) => (value === null || value === undefined ? 0 : Number(value))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!(await requireApiAuth(req, res))) return

  const { month, year } = req.query
  if (typeof month !== 'string' || typeof year !== 'string' || !/^\d{4}$/.test(year)) {
    return res.status(400).json({ error: 'A valid month and year are required' })
  }

  const allMonths = month.toLowerCase() === ALL_MONTHS.toLowerCase()
  const monthIndex = MONTHS.findIndex(name => name.toLowerCase() === month.toLowerCase())
  if (!allMonths && monthIndex === -1) {
    return res.status(400).json({ error: 'A valid month and year are required' })
  }

  const yearNumber = Number(year)
  if (yearNumber < 2000 || yearNumber > 2100) {
    return res.status(400).json({ error: 'A valid month and year are required' })
  }

  // Calendar-date bounds: voucherdate has no time zone, so comparing it with a
  // timestamptz parameter depended on the database server's TimeZone setting.
  const periodStart = allMonths ? `${yearNumber}-01-01` : `${yearNumber}-${String(monthIndex + 1).padStart(2, '0')}-01`
  const periodLength = allMonths ? '1 year' : '1 month'

  try {
    // Monthly profit is a cash book: money debited to the cash/bank accounts is
    // income, money credited out of them is expense. Deriving it from the ledger
    // keeps every month accurate instead of depending on the legacy
    // `monthly_profit` snapshot table, which only ever held a single row.
    const monthRows = await prisma.$queryRaw<MonthRow[]>`
      SELECT EXTRACT(MONTH FROM v.voucherdate)::int AS month,
             COALESCE(SUM(COALESCE(vt.debitamount, 0)), 0)::bigint AS income,
             COALESCE(SUM(COALESCE(vt.creditamount, 0)), 0)::bigint AS expenses
      FROM voucher_trans vt
      JOIN vouchers v ON v.voucherno = vt.voucherno
      JOIN accounts_head ah
        ON ah.accountcode = vt.accountcode
       AND ah.accounttype = 1
       AND COALESCE(ah.isdeleted, false) = false
      WHERE COALESCE(v.isdeleted, false) = false
        AND v.voucherdate >= ${periodStart}::date
        AND v.voucherdate < (${periodStart}::date + ${periodLength}::interval)
      GROUP BY 1
      ORDER BY 1
    `

    // The desktop detail statement: "All Income Accounts" are the cash accounts
    // with what came into them, "All Expense Accounts" are the accounts each
    // payment out of cash was booked against. Every cash voucher balances, so
    // the expense lines add up to the Expenses figure above.
    const accountRows = await prisma.$queryRaw<AccountRow[]>`
      WITH cash AS (
        SELECT accountcode
        FROM accounts_head
        WHERE accounttype = 1 AND COALESCE(isdeleted, false) = false
      ),
      lines AS (
        SELECT vt.voucherno,
               vt.accountcode,
               COALESCE(vt.debitamount, 0) AS debit,
               COALESCE(vt.creditamount, 0) AS credit,
               vt.accountcode IN (SELECT accountcode FROM cash) AS is_cash
        FROM voucher_trans vt
        JOIN vouchers v ON v.voucherno = vt.voucherno
        WHERE COALESCE(v.isdeleted, false) = false
          AND v.voucherdate >= ${periodStart}::date
          AND v.voucherdate < (${periodStart}::date + ${periodLength}::interval)
      ),
      paid_out AS (
        SELECT DISTINCT voucherno FROM lines WHERE is_cash AND credit > 0
      ),
      totals AS (
        SELECT 'income' AS kind, accountcode, SUM(debit) AS amount
        FROM lines
        WHERE is_cash
        GROUP BY accountcode
        UNION ALL
        SELECT 'expense' AS kind, accountcode, SUM(debit) AS amount
        FROM lines
        WHERE NOT is_cash AND voucherno IN (SELECT voucherno FROM paid_out)
        GROUP BY accountcode
      )
      SELECT t.kind, t.accountcode, ah.accountname, t.amount::bigint AS amount
      FROM totals t
      LEFT JOIN LATERAL (
        SELECT accountid, accountname
        FROM accounts_head
        WHERE accountcode = t.accountcode
        ORDER BY COALESCE(isdeleted, false), id
        LIMIT 1
      ) ah ON true
      WHERE t.amount <> 0
      ORDER BY ah.accountid NULLS LAST, t.accountcode
    `

    const result = monthRows
      .map(row => {
        const income = toNumber(row.income)
        const expenses = toNumber(row.expenses)

        return {
          id: row.month,
          monthname: MONTHS[row.month - 1],
          monthyear: year,
          income,
          expenses,
          actualprofit: income - expenses
        }
      })
      .filter(row => row.income !== 0 || row.expenses !== 0)

    const income = result.reduce((sum, row) => sum + row.income, 0)
    const expenses = result.reduce((sum, row) => sum + row.expenses, 0)
    const accounts = (kind: AccountRow['kind']) =>
      accountRows
        .filter(row => row.kind === kind)
        .map(row => ({ accountcode: row.accountcode, accountname: row.accountname, amount: toNumber(row.amount) }))

    return res.status(200).json({
      result,
      total: { income, expenses, actualprofit: income - expenses },
      incomeAccounts: accounts('income'),
      expenseAccounts: accounts('expense')
    })
  } catch (error) {
    console.error('Failed to fetch monthly profit data:', error)

    return res.status(500).json({ error: 'Failed to fetch monthly profit data' })
  }
}
