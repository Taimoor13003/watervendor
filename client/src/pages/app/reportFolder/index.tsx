import React, { useState } from 'react';
import RatePerBottleTable from 'src/views/orders/table/RatePerBottleTable';
import { Box, Button, TextField, Typography, CircularProgress, Paper } from '@mui/material';
import toast from 'react-hot-toast';

const InputComponent = () => {
  const [ratePerBottle, setRatePerBottle] = useState<number | ''>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratePerBottle === '') return;

    setLoading(true);

    try {
      const response = await fetch(`/api/getCustomersByBottleRate?rate=${encodeURIComponent(ratePerBottle.toString())}`);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log('Fetched data:', data);
      if (Array.isArray(data) && data.length === 0) {
        toast.error(`No customers found with bottle rate: ${ratePerBottle}`, { duration: 4000 });
      }
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(`Something went wrong`, { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom style={{ textAlign: 'center', fontWeight: 'bolder' }}>
        Enter Rate to View Customer list according to rate:
      </Typography>

      {/* White box wrapper */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          <TextField
            id="ratePerBottle"
            label="Rate per Bottle"
            type="number"
            value={ratePerBottle === 0 ? '' : ratePerBottle}
            onChange={(e) => {
              setRatePerBottle(Number(e.target.value));
            }}
            required
            variant="outlined"
            sx={{ flex: 1 }}
            inputProps={{ min: 0 }}

          />

          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </form>
      </Paper>

      {/* Loader */}
      {loading && (
        <Box mt={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {/* Table */}
      {!loading && tableData.length > 0 && (
        <Box mt={4}>
          <RatePerBottleTable data={tableData} ratePerBottle={Number(ratePerBottle)} />
        </Box>
      )}
    </Box>
  );
};

export default InputComponent;
