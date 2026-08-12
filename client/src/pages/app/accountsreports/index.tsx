import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AccountDetailsTable from 'src/views/orders/table/AccountDetailsTable'
import { firebaseAuth } from 'src/services/firebase.service'

interface Account {
  accountcode: string
  accountname: string
}

interface Voucher {
  id: number | string
  paymentmode: string
}

interface RowData {
  id: number
  voucherno: string
  accountcode: string
  voucherdate: string
  debitamount: number
  creditamount: number
  description?: string
  runningBalance?: number
}

const AccountAndVoucherPage = () => {
  const [accountCode, setAccountCode] = useState<string>('')
  const [voucherType, setVoucherTypeValue] = useState<number | ''>('')
  const [voucherPeriodFrom, setVoucherPeriodFrom] = useState<string>('')
  const [voucherPeriodTo, setVoucherPeriodTo] = useState<string>('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [accountDetails, setAccountDetails] = useState<RowData[]>([]) // State to store fetched account details
  const [openingBalance, setOpeningBalance] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [hasRunReport, setHasRunReport] = useState(false)

  const getAuthHeaders = async () => {
    const idToken = await firebaseAuth.currentUser?.getIdToken()

    return idToken ? { Authorization: `Bearer ${idToken}` } : undefined
  }

  // Derived validation: From date should not be after To date
  const isDateRangeValid =
    !voucherPeriodFrom ||
    !voucherPeriodTo ||
    new Date(voucherPeriodFrom).getTime() <= new Date(voucherPeriodTo).getTime()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const headers = await getAuthHeaders()
        const accountResponse = await axios.get<{ accounts: Account[] }>('/api/accountnames', { headers })
        setAccounts(accountResponse.data.accounts)
        const voucherResponse = await axios.get<{ vouchers: Voucher[] }>('/api/vouchersdropdown', { headers })
        setVouchers(voucherResponse.data.vouchers)
      } catch (error) {
        setError('Failed to fetch data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async () => {
    if (!isDateRangeValid) {
      setError('Voucher Period From cannot be later than Voucher Period To.')
      return
    }
    setLoading(true)
    setError('') // Clear previous error messages
    setHasRunReport(false)
    try {
      const headers = await getAuthHeaders()
      const response = await axios.get<{ result: RowData[]; openingBalance: number }>('/api/accountdetails', {
        headers,
        params: {
          accountcode: accountCode,
          vouchertype: voucherType,
          voucherperiodfrom: voucherPeriodFrom,
          voucherperiodto: voucherPeriodTo
        }
      })
      let runningBalance = Number(response.data.openingBalance || 0)
      setOpeningBalance(runningBalance)
      setAccountDetails(
        response.data.result.map(row => {
          runningBalance += Number(row.debitamount || 0) - Number(row.creditamount || 0)

          return { ...row, runningBalance }
        })
      )
      setHasRunReport(true)
    } catch (error) {
      setError('Failed to fetch data from account details API.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant='h4' fontWeight={700} textAlign='center' gutterBottom>
        Account Reports
      </Typography>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
        <Typography variant='h6' mb={2}>
          Filter Criteria
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id='accountcode-label'>Account Name</InputLabel>
              <Select
                labelId='accountcode-label'
                value={accountCode}
                onChange={e => setAccountCode(e.target.value as string)}
                label='Account Name'
                required
              >
                {accounts.map(account => (
                  <MenuItem key={account.accountcode} value={account.accountcode}>
                    {account.accountname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id='vouchertype-label'>Voucher Type</InputLabel>
              <Select
                labelId='vouchertype-label'
                value={voucherType}
                onChange={e => setVoucherTypeValue(e.target.value as number)}
                label='Voucher Type'
                required
              >
                <MenuItem value=''>All voucher types</MenuItem>
                {vouchers.map(voucher => (
                  <MenuItem key={voucher.id} value={voucher.id}>
                    {voucher.paymentmode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Voucher Period From'
              type='date'
              value={voucherPeriodFrom}
              onChange={e => setVoucherPeriodFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!voucherPeriodFrom && !!voucherPeriodTo && !isDateRangeValid}
              helperText={
                !!voucherPeriodFrom && !!voucherPeriodTo && !isDateRangeValid
                  ? 'From date cannot be after To date.'
                  : ' '
              }
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Voucher Period To'
              type='date'
              value={voucherPeriodTo}
              onChange={e => setVoucherPeriodTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!voucherPeriodFrom && !!voucherPeriodTo && !isDateRangeValid}
              helperText={
                !!voucherPeriodFrom && !!voucherPeriodTo && !isDateRangeValid
                  ? 'To date must be on or after From date.'
                  : ' '
              }
              required
            />
          </Grid>

          <Grid item xs={12} display='flex' gap={2} justifyContent={{ xs: 'stretch', sm: 'flex-end' }}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setAccountCode('')
                setVoucherTypeValue('' as any)
                setVoucherPeriodFrom('')
                setVoucherPeriodTo('')
                setAccountDetails([])
                setOpeningBalance(0)
                setHasRunReport(false)
                setError('')
              }}
            >
              Reset
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleSubmit}
              disabled={loading || !accountCode || !voucherPeriodFrom || !voucherPeriodTo || !isDateRangeValid}
            >
              {loading ? 'Loading...' : 'Run Report'}
            </Button>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity='error'>{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {hasRunReport && accountDetails.length > 0 && (
        <Box>
          <AccountDetailsTable data={accountDetails} openingBalance={openingBalance} />
        </Box>
      )}
      {hasRunReport && accountDetails.length === 0 && (
        <Alert severity='info'>No posted vouchers matched the selected account, type, and date range.</Alert>
      )}
    </Box>
  )
}

export default AccountAndVoucherPage
