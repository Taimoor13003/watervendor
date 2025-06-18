import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import AccountRecievableTable from 'src/views/orders/table/AccountRecievableTable';

const AccountsReceivablePage = () => {
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [showTable, setShowTable] = useState(false);

  const handleSubmit = () => {
    if (month && year) {
      setShowTable(true);
      // You can fetch data using month/year here
      console.log('Fetching report for:', month, year);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 10 }, (_, i) => `${2020 + i}`);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
        Account Receivable Report
      </Typography>

      {/* White card with dropdowns */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" mb={2}>
          Select Month & Year to view Account Receivable Report
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="month-label">Month</InputLabel>
          <Select
            labelId="month-label"
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            {months.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value)}
            required
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!month || !year}
          >
            Run Report
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setMonth('');
              setYear('');
              setShowTable(false);
            }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>

      {showTable && (
        <Box mt={4}>
          <AccountRecievableTable month={month} year={year} />
        </Box>
      )}
    </Box>
  );
};

export default AccountsReceivablePage;
