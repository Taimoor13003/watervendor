import React, { useState } from 'react'
import ProfitLossTable from 'src/views/orders/table/ProfitLossTable'
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material'

const ProfitLossReportPage = () => {
  const [month, setMonth] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [showTable, setShowTable] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: 10 }, (_, i) => `${2020 + i}`)

  const handleRunReport = () => {
    if (month && year) {
      // Keep API behavior unchanged. This only toggles table visibility.
      setShowTable(true)
    }
  }

  const handleCancel = () => {
    setMonth('')
    setYear('')
    setShowTable(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' textAlign='center' fontWeight='bold' gutterBottom>
        Monthly Profit / Loss
      </Typography>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
        <Typography variant='h6' mb={2}>
          Select Month & Year
        </Typography>

        <FormControl fullWidth margin='normal'>
          <InputLabel id='month-label'>Month</InputLabel>
          <Select
            labelId='month-label'
            value={month}
            label='Month'
            onChange={e => setMonth(e.target.value)}
            required
          >
            {months.map(m => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin='normal'>
          <InputLabel id='year-label'>Year</InputLabel>
          <Select
            labelId='year-label'
            value={year}
            label='Year'
            onChange={e => setYear(e.target.value)}
            required
          >
            {years.map(y => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={3} display='flex' justifyContent='space-between'>
          <Button variant='contained' color='primary' onClick={handleRunReport} disabled={!month || !year}>
            Run Report
          </Button>
          <Button variant='outlined' color='secondary' onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
      </Paper>

      {showTable && (
        <Box mt={4}>
          {/* Table remains unchanged; not passing filters to avoid changing API contracts */}
          <ProfitLossTable />
        </Box>
      )}
    </Box>
  )
}

export default ProfitLossReportPage