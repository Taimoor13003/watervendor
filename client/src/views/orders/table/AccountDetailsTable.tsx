import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

interface RowData {
  id: number; // Added id field
  voucherno: string;
  accountcode: string;
  voucherdate: string;
  debitamount: number;
  creditamount: number;
}

const AccountDetailsTable = ({ data }: { data: RowData[] }) => {


  
  const totalDebitAmount = data.reduce((sum, row) => sum + (row.debitamount || 0), 0);
  const totalCreditAmount = data.reduce((sum, row) => sum + (row.creditamount || 0), 0);

  const dataWithTotal = [
    ...data,
    {
      id: data.length + 1, // Unique ID for total row
      voucherno: 'Total',
      accountcode: '',
      voucherdate: '',
      debitamount: totalDebitAmount,
      creditamount: totalCreditAmount,
    } as RowData
  ];

  const columns: GridColDef[] = [
    {
      flex: 0.15,
      minWidth: 150,
      field: 'voucherno',
      headerName: 'Voucher No.',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.voucherno}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'accountcode',
      headerName: 'Account Code',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.accountcode}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'voucherdate',
      headerName: 'Voucher Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {new Date(params.row.voucherdate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'debitamount',
      headerName: 'Debit Amount',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.debitamount ? params.row.debitamount.toFixed(2) : '0.00'}
        </Typography>
      ),
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'creditamount',
      headerName: 'Credit Amount',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.creditamount ? params.row.creditamount.toFixed(2) : '0.00'}
        </Typography>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader title='Account Details' />
      <Grid container paddingX={5} display='flex' justifyContent='space-between'>
        {/* No search input needed here */}
      </Grid>

      <DataGrid
        autoHeight
        columns={columns}
        pageSizeOptions={[7, 10, 25, 50]}
        rows={dataWithTotal}
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: '1.125rem',
          },
          '& .total-row': {
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5', // Light background color for the total row
          },
        }}
        getRowId={(row) => row.id} // Specify the custom id for each row
        components={{
          Footer: () => (
            <Box sx={{ padding: 2 }}>
              <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                Total Debit Amount: {totalDebitAmount.toFixed(2)}
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                Total Credit Amount: {totalCreditAmount.toFixed(2)}
              </Typography>
            </Box>
          ),
        }}
      />
    </Card>
  );
};

export default AccountDetailsTable;
