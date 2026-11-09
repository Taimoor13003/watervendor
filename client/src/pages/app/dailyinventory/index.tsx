import React, { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import DailyInventoryReport, {
  DailyInventoryCustomerRow,
  DailyInventoryDay
} from 'src/views/orders/table/DailyInventoryReport'
import { firebaseAuth } from 'src/services/firebase.service'
import { formatDisplayDate } from 'src/lib/display-date'

const pad = (n: number) => String(n).padStart(2, '0')

// Today in the browser's own time zone; toISOString() would give the UTC day.
const today = () => {
  const now = new Date()

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const DailyInventoryPage = () => {
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [days, setDays] = useState<DailyInventoryDay[]>([])
  const [customers, setCustomers] = useState<DailyInventoryCustomerRow[]>([])
  const [period, setPeriod] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Select both dates first.')

      return
    }

    if (startDate > endDate) {
      setError('The "from" date must be on or before the "to" date.')

      return
    }

    setLoading(true)
    setError('')
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken()
      const response = await fetch(
        `/api/dailyinventory?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
        { headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined }
      )
      const body = await response.json()
      if (!response.ok) throw new Error(body?.error || 'Unable to load the daily inventory report')

      setDays(Array.isArray(body.days) ? body.days : [])
      setCustomers(Array.isArray(body.customers) ? body.customers : [])
      setTruncated(Boolean(body.truncated))
      setPeriod(
        startDate === endDate
          ? formatDisplayDate(startDate)
          : `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`
      )
    } catch (requestError) {
      setDays([])
      setCustomers([])
      setTruncated(false)
      setPeriod('')
      setError(requestError instanceof Error ? requestError.message : 'Unable to load the daily inventory report')
    } finally {
      setLoading(false)
    }
  }

  // Open on today's report; other dates are a pick and Run Report away.
  useEffect(() => {
    handleSubmit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <TextField
          type='date'
          label='From'
          value={startDate}
          onChange={event => setStartDate(event.target.value)}
          margin='normal'
          InputLabelProps={{ shrink: true }}
          sx={{ flex: '1 1 200px' }}
        />
        <TextField
          type='date'
          label='To'
          value={endDate}
          onChange={event => setEndDate(event.target.value)}
          margin='normal'
          InputLabelProps={{ shrink: true }}
          sx={{ flex: '1 1 200px' }}
        />
      </Box>

      <Button variant='contained' color='primary' onClick={handleSubmit} disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Running...' : 'Run Report'}
      </Button>

      {error ? (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

      {truncated ? (
        <Alert severity='warning' sx={{ mt: 2 }}>
          Too many customers to list; pick a shorter period to see them all.
        </Alert>
      ) : null}

      <Box mt={3}>
        <DailyInventoryReport days={days} customers={customers} period={period} />
      </Box>
    </Box>
  )
}

export default DailyInventoryPage
