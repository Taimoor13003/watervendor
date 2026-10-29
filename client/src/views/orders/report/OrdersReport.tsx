import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { format, startOfMonth, startOfYear, subDays, subMonths } from 'date-fns'
import DatePicker from 'react-datepicker'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

import CustomTextField from 'src/@core/components/mui/text-field'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { authHeaders } from 'src/lib/api-client'

type ReportRow = {
  orderid: number | null
  orderno: string | null
  orderdate: string | null
  customerid: number | null
  customername: string | null
  telephone: string | null
  deliveryaddress: string | null
  deliveryarea: string | null
  deliverydate: string | null
  orderqty: number | null
  orderstatus: string | null
}

type CustomerOption = { customerid: number; name: string }

// Mirrors the "Select Order Report by" choices in the desktop system. The
// client asked for Employee wise to be left out.
const REPORT_MODES = [
  { value: 'date', label: 'Date Wise' },
  { value: 'status', label: 'Order Status' },
  { value: 'customer', label: 'Customer Wise' }
]

const ORDER_STATUSES = ['Cancel', 'Completed', 'In Progress', 'New']

// One-click ranges for "how many orders went out in ...", each ending today.
const QUICK_RANGES: Array<{ label: string; from: (today: Date) => Date }> = [
  { label: 'Last 10 days', from: today => subDays(today, 9) },
  { label: 'Last 20 days', from: today => subDays(today, 19) },
  { label: 'This month', from: today => startOfMonth(today) },
  { label: 'Last 2 months', from: today => subMonths(today, 2) },
  { label: 'This year', from: today => startOfYear(today) }
]

const formatDate = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? '' : format(date, 'dd MMM yyyy')
}

const OrdersReport = () => {
  const today = useMemo(() => new Date(), [])
  const [reportFrom, setReportFrom] = useState<Date | null>(today)
  const [reportTo, setReportTo] = useState<Date | null>(today)
  const [reportBy, setReportBy] = useState<string>('date')
  const [orderStatus, setOrderStatus] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('')

  const [rows, setRows] = useState<ReportRow[] | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ranFrom, setRanFrom] = useState<string>('')
  const [ranTo, setRanTo] = useState<string>('')
  const [customers, setCustomers] = useState<CustomerOption[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const resp = await axios.get('/api/orders-report/customers', { headers: await authHeaders() })
        if (!cancelled) setCustomers(Array.isArray(resp.data?.customers) ? resp.data.customers : [])
      } catch {
        if (!cancelled) setCustomers([])
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const runReport = useCallback(async (rangeFrom: Date | null = reportFrom, rangeTo: Date | null = reportTo) => {
    if (!rangeFrom || !rangeTo) {
      setError('Report From and Report To are both required.')

      return
    }

    // Compare calendar days: the pickers can carry different times of day.
    const from = format(rangeFrom, 'yyyy-MM-dd')
    const to = format(rangeTo, 'yyyy-MM-dd')

    if (from > to) {
      setError('Report From must be on or before Report To.')

      return
    }

    setLoading(true)
    setError(null)
    try {
      const resp = await axios.get('/api/orders-report', {
        params: {
          startDate: from,
          endDate: to,
          reportBy,
          status: reportBy === 'status' ? orderStatus : undefined,
          customerId: reportBy === 'customer' ? customerId : undefined
        },
        headers: await authHeaders()
      })
      setRows(Array.isArray(resp.data?.result) ? resp.data.result : [])
      setTruncated(Boolean(resp.data?.truncated))
      setRanFrom(from)
      setRanTo(to)
    } catch (err: any) {
      setRows(null)
      setError(err?.response?.data?.error || 'The report could not be generated. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [reportFrom, reportTo, reportBy, orderStatus, customerId])

  // Orders are grouped under the heading matching the selected report mode, the
  // way the desktop report separates its sections.
  const groups = useMemo(() => {
    if (!rows) return []
    const keyFor = (row: ReportRow) => {
      if (reportBy === 'customer') return row.customername || 'Unknown customer'
      if (reportBy === 'status') return row.orderstatus || 'No status'

      return formatDate(row.orderdate) || 'No order date'
    }

    const map = new Map<string, ReportRow[]>()
    rows.forEach(row => {
      const key = keyFor(row)
      const bucket = map.get(key)
      if (bucket) bucket.push(row)
      else map.set(key, [row])
    })

    return Array.from(map.entries())
  }, [rows, reportBy])

  // Orders per status, e.g. "Completed 412 · Cancel 3", for the summary line.
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>()
    ;(rows || []).forEach(row => {
      const key = row.orderstatus === 'Canceled' ? 'Cancel' : row.orderstatus || 'No status'
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    return Array.from(counts.entries())
  }, [rows])

  const applyQuickRange = (from: (today: Date) => Date) => {
    const today = new Date()
    const start = from(today)
    setReportFrom(start)
    setReportTo(today)
    runReport(start, today)
  }

  const totalBottles = useMemo(
    () => (rows || []).reduce((sum, row) => sum + (row.orderqty || 0), 0),
    [rows]
  )

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card className='no-print'>
            <CardHeader
              title='Order Reports'
              subheader='View Orders by Date wise, Order Status Wise, Customer Wise'
            />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    selected={reportFrom}
                    onChange={(date: Date | null) => setReportFrom(date)}
                    dateFormat='dd/MM/yyyy'
                    customInput={<CustomTextField fullWidth label='Report From' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    selected={reportTo}
                    onChange={(date: Date | null) => setReportTo(date)}
                    dateFormat='dd/MM/yyyy'
                    customInput={<CustomTextField fullWidth label='Report To' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Select Order Report by'
                    value={reportBy}
                    onChange={event => {
                      setReportBy(event.target.value)
                      setOrderStatus('')
                      setCustomerId('')
                    }}
                  >
                    {REPORT_MODES.map(mode => (
                      <MenuItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>

                {reportBy === 'status' ? (
                  <Grid item xs={12} sm={6} md={3}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Select Order Status'
                      value={orderStatus}
                      onChange={event => setOrderStatus(event.target.value)}
                    >
                      <MenuItem value=''>All statuses</MenuItem>
                      {ORDER_STATUSES.map(status => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>
                ) : null}

                {reportBy === 'customer' ? (
                  <Grid item xs={12} sm={6} md={3}>
                    <CustomTextField
                      select
                      fullWidth
                      label='Select Customer'
                      value={customerId}
                      onChange={event => setCustomerId(event.target.value)}
                    >
                      <MenuItem value=''>All customers</MenuItem>
                      {customers.map(customer => (
                        <MenuItem key={customer.customerid} value={String(customer.customerid)}>
                          {customer.name}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  </Grid>
                ) : null}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {QUICK_RANGES.map(range => (
                      <Button
                        key={range.label}
                        size='small'
                        variant='outlined'
                        disabled={loading}
                        onClick={() => applyQuickRange(range.from)}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Button variant='contained' onClick={() => runReport()} disabled={loading}>
                      {loading ? 'Running…' : 'Run Report'}
                    </Button>
                    <Button
                      variant='tonal'
                      color='secondary'
                      disabled={!rows || rows.length === 0}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {error ? (
                <Alert severity='error' sx={{ mt: 4 }}>
                  {error}
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </Grid>

        {rows ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h4'>Order Reports</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  <Typography variant='body2'>
                    For Order Date From: {ranFrom ? format(new Date(`${ranFrom}T00:00:00`), 'dd/MM/yyyy') : ''} To:{' '}
                    {ranTo ? format(new Date(`${ranTo}T00:00:00`), 'dd/MM/yyyy') : ''}
                  </Typography>
                  <Typography variant='body2'>
                    {REPORT_MODES.find(mode => mode.value === reportBy)?.label} · {rows.length} order
                    {rows.length === 1 ? '' : 's'} · {totalBottles} bottles
                  </Typography>
                </Box>

                {rows.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                    <Chip color='primary' label={`Total orders: ${rows.length}`} />
                    {statusCounts.map(([status, count]) => (
                      <Chip key={status} variant='outlined' label={`${status}: ${count}`} />
                    ))}
                    <Chip variant='outlined' label={`Bottles: ${totalBottles}`} />
                  </Box>
                ) : null}

                {truncated ? (
                  <Alert severity='warning' sx={{ mt: 3 }}>
                    This range returned more orders than the report can show at once. Only the first {rows.length} are
                    listed — narrow the date range to see the rest.
                  </Alert>
                ) : null}

                {rows.length === 0 ? (
                  <Alert severity='info' sx={{ mt: 3 }}>
                    No orders were found for this report.
                  </Alert>
                ) : null}

                {rows.length > 0 ? (
                  <Grid container spacing={2} sx={{ mt: 4, pb: 1, borderBottom: '2px solid rgba(0,0,0,0.5)' }}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>Order #</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>Order Date</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>Customer Name / Telephone #</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>Delivery Address</Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>Delivery Date</Typography>
                    </Grid>
                  </Grid>
                ) : null}

                {groups.map(([groupName, groupRows]) => (
                  <Box key={groupName} sx={{ mt: 5 }}>
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>
                      {groupName}
                    </Typography>
                    <Divider sx={{ borderBottomWidth: 2, mb: 2 }} />

                    {groupRows.map(row => (
                      <Box
                        key={`${row.orderid}-${row.orderno}`}
                        sx={{
                          py: 2,
                          borderBottom: '1px dashed rgba(0,0,0,0.3)',
                          breakInside: 'avoid'
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography sx={{ fontWeight: 600 }}>{row.orderno || '—'}</Typography>
                            <Typography variant='body2'>Order Quantity : {row.orderqty ?? 0} Bottles.</Typography>
                            <Typography variant='body2'>Order Status : {row.orderstatus || '—'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant='body2'>{formatDate(row.orderdate) || '—'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant='body2'>{row.customername || '—'}</Typography>
                            <Typography variant='body2'>{row.telephone || ''}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                              {row.deliveryaddress || '—'}
                            </Typography>
                            {row.deliveryarea ? (
                              <Typography variant='body2'>Delivery Area : {row.deliveryarea}</Typography>
                            ) : null}
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Typography variant='body2'>{formatDate(row.deliverydate) || '—'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </DatePickerWrapper>
  )
}

export default OrdersReport
