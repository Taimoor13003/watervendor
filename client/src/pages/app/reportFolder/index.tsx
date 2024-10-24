import React, { useState } from 'react';
import RatePerBottleTable from 'src/views/orders/table/RatePerBottleTable';

// MUI Imports
import { Box, Button, TextField, Typography } from '@mui/material';

const InputComponent = () => {
  const [ratePerBottle, setRatePerBottle] = useState<number | ''>('');
  const [tableData, setTableData] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratePerBottle === '') {
      return;
    }

    try {
      const response = await fetch(`/api/getCustomers?rate=${encodeURIComponent(ratePerBottle.toString())}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Type rate per bottle here:
      </Typography>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <TextField
          id="ratePerBottle"
          label="Rate per Bottle"
          type="number"
          value={ratePerBottle}
          onChange={(e) => setRatePerBottle(Number(e.target.value))}
          required
          variant="outlined"
          sx={{ width: '200px' }}
        />
        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </form>

      {tableData.length > 0 && (
        <Box mt={4}>
          <RatePerBottleTable data={tableData} ratePerBottle={Number(ratePerBottle)} />
        </Box>
      )}
    </Box>
  );
};

export default InputComponent;
