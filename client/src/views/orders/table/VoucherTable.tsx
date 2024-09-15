import React, { useEffect, useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import moment from 'moment';

type Voucher = {
  id: number;
  voucherCode: string;
  voucherType: string;
  amount: number;
  voucherdate: string; // Date as ISO string
};

const VoucherTable = ({ vouchers }: { vouchers: Voucher[] }) => {
  const [rows, setRows] = useState<Voucher[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Voucher[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Convert date strings to Date objects
    const updatedRows = vouchers.map(row => ({
      ...row,
      voucherdate: new Date(row.voucherdate), // Convert string to Date object
    }));
    setRows(updatedRows);
  }, [vouchers]);

  // Function to handle search and filter data
  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = vouchers.filter(row => {
      return Object.keys(row).some(field => {
        return searchRegex.test(row[field as keyof Voucher] as unknown as string);
      });
    });
    setFilteredData(filteredRows.length ? filteredRows : []);
  };

  // Escape special characters for regex search
  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  // Columns configuration for DataGrid
  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 180,
      field: 'voucherno',
      headerName: 'Voucher No',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.voucherno}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 180,
      field: 'vouchertype',
      headerName: 'Voucher Type',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.vouchertype}
        </Typography>
      ),
    },
   
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Voucher Date',
      field: 'voucherdate',
      valueGetter: (params) => new Date(params.row.voucherdate), // Convert ISO string to Date object
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {moment(params.row.voucherdate).format('DD-MM-YYYY')}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'number',
      minWidth: 120,
      field: 'amount',
      headerName: 'Voucher Amount',
      renderCell: (params: GridRenderCellParams) => {
        const amount = params.row.amount;
        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {amount != null && !isNaN(amount) ? amount.toFixed(2) : 'N/A'}
          </Typography>
        );
      },
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={2}>
          <Button variant='contained' onClick={() => router.push(`/app/vouchers/edit?voucherid=${params.row.id}`)}>
            Edit
          </Button>
          <Button variant='contained' onClick={() => setOpen(true)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title='Voucher Table' />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box></Box>
          <Box>
            <Fab color='primary' variant='extended' onClick={() => router.push('/app/vouchers/create')}>
              Create New Voucher
            </Fab>
          </Box>
        </Grid>

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          slots={{ toolbar: QuickSearchToolbar }}
          onPaginationModelChange={setPaginationModel}
          rows={filteredData.length ? filteredData : rows}
          getRowId={(row) => row.id}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.125rem',
            },
          }}
          slotProps={{
            baseButton: {
              size: 'medium',
              variant: 'outlined',
            },
            toolbar: {
              value: searchText,
              clearSearch: () => handleSearch(''),
              onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value),
            },
          }}
        />
      </DatePickerWrapper>

      <DialougeComponent open={open} setOpen={setOpen} onDelete={() => alert("Delete Function")} />
    </Card>
  );
};

export default VoucherTable;
