import React, { useEffect, useState, ChangeEvent, useRef, useCallback } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Icon from 'src/@core/components/icon';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import moment from 'moment';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import axios from 'axios';

const prisma = new PrismaClient();
console.log(prisma);

const VoucherTable = () => {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Updated fetchData function wrapped in useCallback
  const fetchData = useCallback(async () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setIsLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      const adjustedPage = paginationModel.page + 1;
      const { data: { data, count } } = await axios.get(`/api/vouchers`, {
        params: {
          page: adjustedPage,
          limit: paginationModel.pageSize,
          searchText: searchText,
        },
      });
      setRows(data);
      setTotal(count);
      setIsLoading(false);
    }, 1200); // Adjust debounce delay as needed
  }, [paginationModel.page, paginationModel.pageSize, searchText]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  useEffect(() => {
    fetchData();
  }, [paginationModel.page, paginationModel.pageSize, searchText, fetchData]);

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
        <Box
          sx={{
            px: 5,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: theme =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(90deg, rgba(240,248,255,0.65), rgba(225,245,254,0.9))'
                : 'rgba(255,255,255,0.03)'
          }}
        >
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              Vouchers
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Search, filter, and manage vouchers.
            </Typography>
          </Box>
          <Box display='flex' gap={2} flexWrap='wrap'>
            <Button variant='outlined' startIcon={<Icon icon='mdi:filter-variant' />} onClick={() => setSearchText('')}>
              Reset filters
            </Button>
            <Button
              variant='contained'
              startIcon={<Icon icon='mdi:plus' />}
              onClick={() => router.push('/app/vouchers/create')}
            >
              Create voucher
            </Button>
          </Box>
        </Box>

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
