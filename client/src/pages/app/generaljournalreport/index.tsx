import React, { useState } from 'react';
import GeneralJournal from 'src/views/orders/table/GeneralJournal';
import { vouchertypes } from '../../../constant';
import { FormControl, InputLabel, Select, MenuItem, Button, TextField } from '@mui/material';

const GeneralJournalReport = () => {
  const [voucherType, setVoucherType] = useState('');
  const [voucherPeriodFrom, setVoucherPeriodFrom] = useState('');
  const [voucherPeriodTo, setVoucherPeriodTo] = useState('');
  const [journalData, setJournalData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (voucherType === null || !voucherPeriodFrom || !voucherPeriodTo) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch(
        `/api/gj?startDate=${voucherPeriodFrom}&endDate=${voucherPeriodTo}&voucherTypeId=${voucherType}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      setJournalData(data.result);
    } catch (error) {
      setError('Failed to load data. Please try again.');
    }
  };
  return (
    <div>
      <h2>Select Voucher Type and From, To Date for Viewing General Journal</h2>

      <FormControl fullWidth margin="normal">
        <InputLabel id="voucherType-label">Voucher Type</InputLabel>
        <Select
          labelId="voucherType-label"
          value={voucherType}
          onChange={(e) => setVoucherType(e.target.value)}
          label="Voucher Type"
          required
        >
          {vouchertypes.map((vouchertype) => (
            <MenuItem key={vouchertype.id} value={vouchertype.id}>
              {vouchertype.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="date"
        label="Voucher Period From"
        value={voucherPeriodFrom}
        onChange={(e) => setVoucherPeriodFrom(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        type="date"
        label="Voucher Period To"
        value={voucherPeriodTo}
        onChange={(e) => setVoucherPeriodTo(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Run Report
      </Button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <GeneralJournal data={journalData} />
    </div>
  );
};

export default GeneralJournalReport;
