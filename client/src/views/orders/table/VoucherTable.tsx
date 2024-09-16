import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
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
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import axios from 'axios';

const prisma = new PrismaClient();

type Voucher = {
  id: number;
  voucherCode: string;
  voucherType: string;
  amount: number;
  voucherdate: Date; // Date as ISO string
};

const VoucherTable = ({ vouchers }: { vouchers: Voucher[] }) => {
  const [rows, setRows] = useState<Voucher[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setIsLoading(true)
    debounceTimeout.current = setTimeout(async () => {
      const adjustedPage = paginationModel.page + 1;
      const { data: { data, count } } = await axios.get(`/api/vouchers`, {
        params: {
          page: adjustedPage,
          limit: paginationModel.pageSize,
          searchText: searchText
        }
      });
      setRows(data);
      setTotal(count);
      setIsLoading(false)
    }, 1200); // Adjust debounce delay as needed
  };

  // Handle search text change
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to page 1 when search text changes
  };

  useEffect(() => {
    fetchData();
  }, [paginationModel.page, paginationModel.pageSize, searchText]);
  
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
      flex: 0.25,
      minWidth: 180,
      field: 'voucheramount',
      headerName: 'Voucher Amount',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.voucheramount}
        </Typography>
      ),
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
          paginationMode="server"
          rows={rows}
          getRowId={(row) => row.id}
          rowCount={total}
          loading={isLoading}
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
              clearSearch: () => setSearchText(''),
              onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event),
            },
          }}
        />
      </DatePickerWrapper>

      <DialougeComponent open={open} setOpen={setOpen} onDelete={() => alert("Delete Function")} />
    </Card>
  );
};

export default VoucherTable;
