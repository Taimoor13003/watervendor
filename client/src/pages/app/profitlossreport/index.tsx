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
  Typography
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { firebaseAuth } from 'src/services/firebase.service'

type ProfitRow = {
  id: number
  monthname: string | null
  monthyear: string | null
  income: number | null
  expenses: number | null
  actualprofit: number | null
}

const currency = (value: number | null) => Number(value || 0).toLocaleString()

const columns: GridColDef[] = [
  { field: 'monthname', headerName: 'Month', flex: 0.2, minWidth: 140 },
  { field: 'monthyear', headerName: 'Year', flex: 0.15, minWidth: 110 },
  { field: 'income', headerName: 'Income', flex: 0.22, minWidth: 150, valueFormatter: params => currency(params.value) },
  { field: 'expenses', headerName: 'Expenses', flex: 0.22, minWidth: 150, valueFormatter: params => currency(params.value) },
  { field: 'actualprofit', headerName: 'Actual Profit', flex: 0.22, minWidth: 160, valueFormatter: params => currency(params.value) }
]

const ProfitLossReportPage = () => {
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [rows, setRows] = useState<ProfitRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasRunReport, setHasRunReport] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const years = Array.from({ length: 10 }, (_, index) => `${2020 + index}`)

  const handleRunReport = async () => {
    setLoading(true)
    setError('')
    setHasRunReport(false)

    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken()
      const response = await fetch(`/api/monthlyprofit?month=${encodeURIComponent(month)}&year=${year}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Unable to load monthly profit data')

      setRows(Array.isArray(body.result) ? body.result : [])
      setHasRunReport(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load monthly profit data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setMonth('')
    setYear('')
    setRows([])
    setError('')
    setHasRunReport(false)
  }

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
            {months.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
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
      {hasRunReport && !loading && !error && (
        <Box mt={4}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            localeText={{ noRowsLabel: `No profit/loss record was found for ${month} ${year}.` }}
          />
        </Box>
      )}
    </Box>
  )
}

export default ProfitLossReportPage
