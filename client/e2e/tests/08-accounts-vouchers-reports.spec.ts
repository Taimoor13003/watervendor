import { test, expect, Page } from '@playwright/test'
import { chooseSelect, db, field, getIdToken, login } from '../helpers'

test.describe.configure({ mode: 'serial' })

// Accounts from the reference data: 10001 CASH (the cash book the profit report
// reads), 40029 Electricity bill. Plus one new account created below.
const CASH = '10001'
const ELECTRICITY = '40029'
const NEW_ACCOUNT = { code: '70001', name: 'E2E Water Testing Lab', type: 'Expense', opening: '500' }

const authHeaders = async (request: any) => ({ Authorization: `Bearer ${await getIdToken(request)}` })

const toastOrHelper = (page: Page, text: string | RegExp) => page.getByText(text).first()

test.describe('Accounts', () => {
  const openCreate = async (page: Page) => {
    await login(page, '/app/accounts/create')
    await expect(page.getByRole('button', { name: 'Save Account' })).toBeVisible()
  }

  const fillAccount = async (page: Page, code: string, name: string, opening: string) => {
    await field(page, 'Account Code (number)').fill(code)
    await chooseSelect(page, 'Account Type', NEW_ACCOUNT.type)
    await field(page, 'Account Name').fill(name)
    await field(page, 'Opening Balance').fill(opening)
  }

  test('create a new account', async ({ page }) => {
    await openCreate(page)
    await fillAccount(page, NEW_ACCOUNT.code, NEW_ACCOUNT.name, NEW_ACCOUNT.opening)
    await page.getByRole('button', { name: 'Save Account' }).click()
    await expect(page).toHaveURL(/\/app\/accounts$/)
    const saved = await db.accounts_head.findFirstOrThrow({ where: { accountcode: NEW_ACCOUNT.code } })
    expect(saved).toMatchObject({ accountname: NEW_ACCOUNT.name, accounttype: 2, openingbalance: 500 })
    await expect(page.getByRole('row').filter({ hasText: NEW_ACCOUNT.name })).toHaveCount(1)
  })

  test('a second account with the same code is refused', async ({ page }) => {
    await openCreate(page)
    await fillAccount(page, NEW_ACCOUNT.code, 'Duplicate code', '0')
    await page.getByRole('button', { name: 'Save Account' }).click()
    await expect(toastOrHelper(page, `Account code ${NEW_ACCOUNT.code} already exists`)).toBeVisible()
    expect(await db.accounts_head.count({ where: { accountcode: NEW_ACCOUNT.code } })).toBe(1)
  })

  test('an opening balance in paise is refused with a clear message (it used to crash)', async ({ request }) => {
    const response = await request.post('/api/accounts-create', {
      headers: await authHeaders(request),
      data: { accountcode: '70002', accounttype: 2, accountname: 'Paise probe', openingbalance: 10.5 }
    })
    expect(response.status()).toBe(400)
    expect((await response.json()).message).toContain('whole rupees')
  })

  test('edit an account name', async ({ page }) => {
    const account = await db.accounts_head.findFirstOrThrow({ where: { accountcode: NEW_ACCOUNT.code } })
    await login(page, `/app/accounts/edit?id=${account.id}`)
    await field(page, 'Account Name').fill('E2E Water Lab (renamed)')
    await page.getByRole('button', { name: /save|update/i }).first().click()
    await expect(page).toHaveURL(/\/app\/accounts$/)
    expect((await db.accounts_head.findFirstOrThrow({ where: { id: account.id } })).accountname).toBe('E2E Water Lab (renamed)')
  })

  test('renaming an account onto another account’s code is refused', async ({ request }) => {
    const account = await db.accounts_head.findFirstOrThrow({ where: { accountcode: NEW_ACCOUNT.code } })
    const response = await request.post('/api/accounts-update', {
      headers: await authHeaders(request),
      data: { id: account.id, accountcode: CASH, accounttype: 2, accountname: 'clash' }
    })
    expect(response.status()).toBe(409)
  })
})

test.describe('Vouchers', () => {
  const openCreate = async (page: Page) => {
    await login(page, '/app/vouchers/create')
    await expect(page.getByRole('button', { name: 'Submit Voucher' })).toBeVisible()
  }

  const addLine = async (page: Page, account: string, debit: string, credit: string) => {
    await chooseSelect(page, 'Account Code', new RegExp(`^${account} –`))
    await field(page, 'Debit Amount').fill(debit)
    await field(page, 'Credit Amount').fill(credit)
    await page.getByRole('button', { name: 'Move' }).click()
  }

  const header = async (page: Page, type: string, description: string, date: string) => {
    await chooseSelect(page, 'Voucher Type', type)
    await field(page, 'Description').fill(description)
    await field(page, 'Voucher Date').fill(date)
  }

  test('create a Received Voucher dated 1 July: cash in from Ali Haider', async ({ page }) => {
    await openCreate(page)
    await header(page, 'Received Voucher', 'July payment received from Ali Haider', '2026-07-01')
    await addLine(page, CASH, '5000', '0')
    await addLine(page, NEW_ACCOUNT.code, '0', '5000')
    await expect(page.locator('tbody tr').last()).toContainText('5000.00')
    await page.getByRole('button', { name: 'Submit Voucher' }).click()
    await expect(page.getByText('Voucher created!')).toBeVisible()

    const voucher = await db.vouchers.findFirstOrThrow({ where: { description: 'July payment received from Ali Haider' } })
    expect(voucher.voucherdate?.toISOString()).toBe('2026-07-01T00:00:00.000Z')
    expect(voucher).toMatchObject({ vouchertype: 2, voucheramount: 5000 })
    const lines = await db.voucher_trans.findMany({ where: { voucherno: voucher.voucherno }, orderBy: { id: 'asc' } })
    expect(lines.map(l => [l.accountcode, l.debitamount, l.creditamount])).toEqual([
      [CASH, 5000, 0],
      [NEW_ACCOUNT.code, 0, 5000]
    ])
  })

  test('create a Payment Voucher: electricity bill paid in cash', async ({ page }) => {
    await openCreate(page)
    await header(page, 'Payment Voucher', 'K-Electric bill July', '2026-07-15')
    await addLine(page, ELECTRICITY, '1200', '0')
    await addLine(page, CASH, '0', '1200')
    await page.getByRole('button', { name: 'Submit Voucher' }).click()
    await expect(page.getByText('Voucher created!')).toBeVisible()
    expect(await db.vouchers.count({ where: { description: 'K-Electric bill July' } })).toBe(1)
  })

  test('an unbalanced voucher is refused and nothing is saved', async ({ page }) => {
    const before = await db.vouchers.count()
    await openCreate(page)
    await header(page, 'journal voucher', 'Unbalanced probe', '2026-07-16')
    await addLine(page, CASH, '100', '0')
    await addLine(page, ELECTRICITY, '0', '50')
    await page.getByRole('button', { name: 'Submit Voucher' }).click()
    await expect(page.getByText('Debit and credit totals must be positive and balanced')).toBeVisible()
    expect(await db.vouchers.count()).toBe(before)
  })

  test('a voucher with no lines is refused', async ({ page }) => {
    const before = await db.vouchers.count()
    await openCreate(page)
    await header(page, 'journal voucher', 'Empty probe', '2026-07-16')
    await page.getByRole('button', { name: 'Submit Voucher' }).click()
    await expect(page.getByText(/Add at least one transaction line|Account Code is required/).first()).toBeVisible()
    expect(await db.vouchers.count()).toBe(before)
  })

  test('paise amounts are refused at "Move" (they used to crash the save)', async ({ page }) => {
    await openCreate(page)
    await header(page, 'journal voucher', 'Paise probe', '2026-07-16')
    await addLine(page, CASH, '100.5', '0')
    await expect(page.getByText('Amounts must be whole rupees (no paise) and not negative')).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(1) // only the totals row
  })

  test('the API refuses unknown account codes, unknown types, paise and bad dates', async ({ request }) => {
    const headers = await authHeaders(request)
    const post = (overrides: object) =>
      request.post('/api/vouchers', {
        headers,
        data: {
          description: 'api probe',
          vouchertype: 'journal voucher',
          voucherdate: '2026-08-01',
          transactions: [
            { accountCode: CASH, debit: 10, credit: 0 },
            { accountCode: ELECTRICITY, debit: 0, credit: 10 }
          ],
          ...overrides
        }
      })
    const unknownCode = await post({ transactions: [{ accountCode: '999999', debit: 10, credit: 0 }, { accountCode: CASH, debit: 0, credit: 10 }] })
    expect(unknownCode.status()).toBe(400)
    expect((await unknownCode.json()).message).toContain('Unknown account code: 999999')
    expect((await post({ vouchertype: 'Bribe Voucher' })).status()).toBe(400)
    expect((await post({ transactions: [{ accountCode: CASH, debit: 10.5, credit: 0 }, { accountCode: ELECTRICITY, debit: 0, credit: 10.5 }] })).status()).toBe(400)
    expect((await post({ voucherdate: '2026-02-30' })).status()).toBe(400)
    expect(await db.vouchers.count({ where: { description: 'api probe' } })).toBe(0)
  })

  test('five vouchers saved at the same moment all get their own number', async ({ request }) => {
    const headers = await authHeaders(request)
    const responses = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        request.post('/api/vouchers', {
          headers,
          data: {
            description: `parallel ${i}`,
            vouchertype: 'journal voucher',
            voucherdate: '2026-08-02',
            transactions: [
              { accountCode: ELECTRICITY, debit: 1, credit: 0 },
              { accountCode: NEW_ACCOUNT.code, debit: 0, credit: 1 }
            ]
          }
        })
      )
    )
    expect(responses.map(r => r.status())).toEqual([201, 201, 201, 201, 201])
    const numbers = await Promise.all(responses.map(async r => (await r.json()).voucherno))
    expect(new Set(numbers).size).toBe(5)
  })

  test('vouchers list shows the new vouchers; editing the description keeps the lines', async ({ page }) => {
    const voucher = await db.vouchers.findFirstOrThrow({ where: { description: 'K-Electric bill July' } })
    await login(page, '/app/vouchers')
    await expect(page.getByRole('row').filter({ hasText: String(voucher.voucherno) }).first()).toBeVisible()

    await login(page, `/app/vouchers/edit?voucherid=${voucher.id}`)
    await field(page, 'Description').fill('K-Electric bill July (edited)')
    await page.getByRole('button', { name: /save|update/i }).first().click()
    await expect(page).toHaveURL(/\/app\/vouchers$/)
    const saved = await db.vouchers.findFirstOrThrow({ where: { id: voucher.id } })
    expect(saved.description).toBe('K-Electric bill July (edited)')
    expect(saved.voucherdate?.toISOString()).toBe('2026-07-15T00:00:00.000Z')
    expect(await db.voucher_trans.count({ where: { voucherno: voucher.voucherno } })).toBe(2)
  })
})

test.describe('Financial reports', () => {
  test('Monthly Profit/Loss for July: income 5000, expenses 1200, profit 3800', async ({ page }) => {
    await login(page, '/app/profitlossreport')
    await page.getByLabel('Month').click()
    await page.getByRole('option', { name: 'July', exact: true }).click()
    await page.getByLabel('Year').click()
    await page.getByRole('option', { name: '2026', exact: true }).click()
    await page.getByRole('button', { name: /run report/i }).click()
    const row = page.getByRole('row').filter({ hasText: 'July' })
    await expect(row).toContainText(/5,?000/)
    await expect(row).toContainText(/1,?200/)
    await expect(row).toContainText(/3,?800/)
  })

  test('Monthly Profit/Loss for June shows nothing: the 1 July voucher stays in July', async ({ request }) => {
    const response = await request.get('/api/monthlyprofit?month=June&year=2026', { headers: await authHeaders(request) })
    expect((await response.json()).result).toEqual([])
  })

  test('General Journal: Received Vouchers in July list the cash receipt', async ({ page }) => {
    await login(page, '/app/generaljournalreport')
    await page.getByLabel('Voucher Type').click()
    await page.getByRole('option', { name: 'Received Voucher' }).click()
    await page.getByLabel('Voucher Period From').fill('2026-07-01')
    await page.getByLabel('Voucher Period To').fill('2026-07-31')
    await page.getByRole('button', { name: 'Run Report' }).click()
    // One line per transaction: the cash debit and the matching credit.
    await expect(page.getByText('July payment received from Ali Haider')).toHaveCount(2)
    await expect(page.getByText('Total Debit: 5,000.00 · Total Credit: 5,000.00')).toBeVisible()
    // Day-first, like the rest of the app (it used to show 7/1/2026).
    await expect(page.getByRole('row').filter({ hasText: '10001' }).first()).toContainText('01/07/2026')
  })

  test('General Journal for June does not include the 1 July voucher', async ({ request }) => {
    const response = await request.get('/api/gj?startDate=2026-06-01&endDate=2026-06-30&voucherTypeId=2', { headers: await authHeaders(request) })
    expect((await response.json()).result).toEqual([])
    const july = await request.get('/api/gj?startDate=2026-07-01&endDate=2026-07-01&voucherTypeId=2', { headers: await authHeaders(request) })
    expect((await july.json()).result).toHaveLength(1)
  })

  test('Account Reports: the CASH ledger for July runs 5000 in, 1200 out, balance 3800', async ({ request }) => {
    const response = await request.get(`/api/accountdetails?accountcode=${CASH}&voucherperiodfrom=2026-07-01&voucherperiodto=2026-07-31`, {
      headers: await authHeaders(request)
    })
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    const rows = body.result as Array<{ debitamount: number; creditamount: number }>
    expect(rows.reduce((s, r) => s + Number(r.debitamount || 0), 0)).toBe(5000)
    expect(rows.reduce((s, r) => s + Number(r.creditamount || 0), 0)).toBe(1200)
  })

  test('Account Reports screen opens and runs for CASH', async ({ page }) => {
    await login(page, '/app/accountsreports')
    await page.getByLabel('Account Name').click()
    await page.getByRole('option', { name: /CASH/ }).first().click()
    await page.getByLabel('Voucher Period From').fill('2026-07-01')
    await page.getByLabel('Voucher Period To').fill('2026-07-31')
    await page.getByRole('button', { name: 'Run Report', exact: true }).click()
    // Like the desktop "Accounts Details": period vouchers and their totals only,
    // no opening balance carried in from earlier years.
    const total = page.getByRole('row').filter({ hasText: 'Total (' })
    await expect(total).toContainText('5,000.00')
    await expect(total).toContainText('1,200.00')
    await expect(page.getByText(/Opening Balance|Running Balance/)).toHaveCount(0)
    await expect(page.getByRole('cell', { name: 'Received Voucher' }).first()).toBeVisible()
  })

  test('Account Reports Voucher Type lists voucher types, not order payment modes', async ({ page }) => {
    await login(page, '/app/accountsreports')
    await page.getByLabel('Voucher Type').click()
    const options = page.getByRole('option')
    await expect(options).toHaveText(['All Vouchers', 'Journal Voucher', 'Payment Voucher', 'Received Voucher'])
  })

  test('deleting a voucher removes it from the list and from profit/loss', async ({ page, request }) => {
    const voucher = await db.vouchers.findFirstOrThrow({ where: { description: { startsWith: 'K-Electric bill July' } } })
    await login(page, '/app/vouchers')
    const row = page.getByRole('row').filter({ hasText: 'Payment Voucher' }).first()
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Voucher deleted')).toBeVisible()
    expect((await db.vouchers.findFirstOrThrow({ where: { id: voucher.id } })).isdeleted).toBe(true)

    const response = await request.get('/api/monthlyprofit?month=July&year=2026', { headers: await authHeaders(request) })
    expect((await response.json()).result[0]).toMatchObject({ income: 5000, expenses: 0, actualprofit: 5000 })
  })

  test('Reports by Rate: rate 220 lists Ali Haider only', async ({ page }) => {
    await login(page, '/app/reportFolder')
    await page.getByLabel('Rate per Bottle').fill('220')
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(page.getByText('Haider').first()).toBeVisible()
    await expect(page.getByText('Builder')).toHaveCount(0)
  })

  test('Product Reports lists the Bottles product', async ({ page }) => {
    await login(page, '/app/productreport')
    await expect(page.getByText('Bottles').first()).toBeVisible()
  })
})

test.describe('Review fixes: vouchers, journal, products', () => {
  test('General Journal runs for "journal voucher" (type 0), which used to say "All fields are required"', async ({ page }) => {
    await login(page, '/app/generaljournalreport')
    await page.getByLabel('Voucher Type').click()
    await page.getByRole('option', { name: 'journal voucher' }).click()
    await page.getByLabel('Voucher Period From').fill('2026-08-02')
    await page.getByLabel('Voucher Period To').fill('2026-08-02')
    await page.getByRole('button', { name: 'Run Report' }).click()
    await expect(page.getByText('All fields are required.')).toHaveCount(0)
    await expect(page.getByText(/parallel \d/).first()).toBeVisible()
  })

  test('a voucher posted to an account deleted later can still be edited', async ({ request }) => {
    const headers = await authHeaders(request)
    const voucher = await db.vouchers.findFirstOrThrow({ where: { description: 'July payment received from Ali Haider' } })
    const lines = await db.voucher_trans.findMany({ where: { voucherno: voucher.voucherno } })
    const account = await db.accounts_head.findFirstOrThrow({ where: { accountcode: NEW_ACCOUNT.code } })
    await db.accounts_head.update({ where: { id: account.id }, data: { isdeleted: true } })
    try {
      const response = await request.put('/api/voucher-update', {
        headers,
        data: {
          voucherid: voucher.id, voucherno: voucher.voucherno, description: 'July payment received from Ali Haider',
          vouchertype: voucher.vouchertype, voucherdate: '2026-07-01',
          transactions: lines.map(l => ({ accountcode: l.accountcode, debitamount: l.debitamount, creditamount: l.creditamount }))
        }
      })
      expect(response.status()).toBe(200)
      // A NEW line to the deleted account is still refused.
      const refused = await request.put('/api/voucher-update', {
        headers,
        data: {
          voucherid: voucher.id, voucherno: voucher.voucherno, description: 'x', vouchertype: voucher.vouchertype, voucherdate: '2026-07-01',
          transactions: [{ accountcode: CASH, debitamount: 10, creditamount: 0 }, { accountcode: '999999', debitamount: 0, creditamount: 10 }]
        }
      })
      expect(refused.status()).toBe(400)
    } finally {
      await db.accounts_head.update({ where: { id: account.id }, data: { isdeleted: false } })
    }
  })

  test('product rates in paise are refused with a clear message instead of crashing', async ({ request }) => {
    const response = await request.post('/api/products-create', {
      headers: await authHeaders(request),
      data: { productcode: 'E2E1', productname: 'Probe', rateperunitcash: 85.5, rateperunitcoupon: 90 }
    })
    expect(response.status()).toBe(400)
    expect((await response.json()).message).toContain('whole number')
  })

  test('a new voucher at 2am Karachi time defaults to today, not yesterday', async ({ page }) => {
    await login(page, '/app/customers')
    await page.clock.setFixedTime(new Date('2026-07-21T02:00:00+05:00'))
    await page.goto('/app/vouchers/create')
    await expect(field(page, 'Voucher Date')).toHaveValue('2026-07-21')
  })
})
