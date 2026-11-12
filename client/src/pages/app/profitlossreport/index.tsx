import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { firebaseAuth } from 'src/services/firebase.service'
import { authFetch } from 'src/lib/api-client'

type ProfitRow = {
  id: number
  monthname: string | null
  monthyear: string | null
  income: number | null
  expenses: number | null
  actualprofit: number | null
}

type AccountLine = { accountcode: string | null; accountname: string | null; amount: number }

type Statement = {
  result: ProfitRow[]
  total: { income: number; expenses: number; actualprofit: number }
  incomeAccounts: AccountLine[]
  expenseAccounts: AccountLine[]
}

const ALL_MONTHS = 'All Months'

const currency = (value: number | null) =>
  Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const accountLabel = (line: AccountLine) =>
  line.accountname ? `${line.accountcode}-${line.accountname.trim()}` : `${line.accountcode} (not in Chart of Accounts)`

const AccountsTable = ({ title, lines }: { title: string; lines: AccountLine[] }) => (
  <Box mt={4}>
    <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
      {title}
    </Typography>
    <Table size='small'>
      <TableHead>
        <TableRow>
          <TableCell>Account Code</TableCell>
          <TableCell align='right'>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.length === 0 && (
          <TableRow>
            <TableCell colSpan={2}>None</TableCell>
          </TableRow>
        )}
        {lines.map(line => (
          <TableRow key={line.accountcode ?? ''}>
            <TableCell>{accountLabel(line)}</TableCell>
            <TableCell align='right'>{currency(line.amount)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
          <TableCell align='right' sx={{ fontWeight: 'bold' }}>
            {currency(lines.reduce((sum, line) => sum + line.amount, 0))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Box>
)

const ProfitLossReportPage = () => {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [statement, setStatement] = useState<Statement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const years = Array.from({ length: 10 }, (_, index) => `${2020 + index}`)

  const handleRunReport = async () => {
    setLoading(true)
    setError('')
    setStatement(null)

    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken()
      const response = await authFetch(`/api/monthlyprofit?month=${encodeURIComponent(month)}&year=${year}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Unable to load monthly profit data')

      setStatement({
        result: Array.isArray(body.result) ? body.result : [],
        total: body.total ?? { income: 0, expenses: 0, actualprofit: 0 },
        incomeAccounts: Array.isArray(body.incomeAccounts) ? body.incomeAccounts : [],
        expenseAccounts: Array.isArray(body.expenseAccounts) ? body.expenseAccounts : []
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load monthly profit data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setMonth('')
    setYear('')
    setStatement(null)
    setError('')
  }

  const allMonths = month === ALL_MONTHS

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' textAlign='center' fontWeight='bold' gutterBottom>
        Monthly Profit / Loss
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
        <Typography variant='h6' mb={2}>Select Month & Year</Typography>
        <FormControl fullWidth margin='normal'>
          <InputLabel id='month-label'>Month</InputLabel>
          <Select labelId='month-label' value={month} label='Month' onChange={event => setMonth(event.target.value)}>
            {[ALL_MONTHS, ...months].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth margin='normal'>
          <InputLabel id='year-label'>Year</InputLabel>
          <Select labelId='year-label' value={year} label='Year' onChange={event => setYear(event.target.value)}>
            {years.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select>
        </FormControl>
        <Box mt={3} display='flex' justifyContent='space-between'>
          <Button variant='contained' onClick={handleRunReport} disabled={!month || !year || loading}>
            Run Report
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleCancel}>Cancel</Button>
        </Box>
      </Paper>

      {loading && <Box display='flex' justifyContent='center' my={4}><CircularProgress /></Box>}
      {error && <Alert severity='error' sx={{ mt: 3 }}>{error}</Alert>}
      {statement && !loading && !error && (
        <Paper elevation={3} sx={{ mt: 4, p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            {allMonths ? `Profit & Expense Statement ${year}` : 'Monthly Profit & Expense Statement'}
          </Typography>

          {statement.result.length === 0 ? (
            <Typography mt={2}>
              No profit/loss record was found for {allMonths ? year : `${month} ${year}`}.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month Name & Year</TableCell>
                      <TableCell align='right'>Income</TableCell>
                      <TableCell align='right'>Expenses</TableCell>
                      <TableCell align='right'>Actual Profit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statement.result.map(row => (
                      <TableRow key={row.id}>
                        <TableCell>{`${row.monthname} ${row.monthyear}`}</TableCell>
                        <TableCell align='right'>{currency(row.income)}</TableCell>
                        <TableCell align='right'>{currency(row.expenses)}</TableCell>
                        <TableCell align='right'>{currency(row.actualprofit)}</TableCell>
                      </TableRow>
                    ))}
                    {allMonths && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{`Total ${year}`}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 'bold' }}>{currency(statement.total.income)}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 'bold' }}>{currency(statement.total.expenses)}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 'bold' }}>{currency(statement.total.actualprofit)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <AccountsTable title='All Income Accounts' lines={statement.incomeAccounts} />
              <AccountsTable title='All Expense Accounts' lines={statement.expenseAccounts} />
            </>
          )}
        </Paper>
      )}
    </Box>
  )
}

export default ProfitLossReportPage
