// Updated OrderTable.tsx

import React, { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel
} from '@mui/x-data-grid';
import {
  Typography,
  Box,
  Grid,
  Button,
  Fab,
  Card,
  Chip,
  IconButton
} from '@mui/material';
import Icon from 'src/@core/components/icon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import moment from 'moment';

import CustomInput from './DatePicker/CustomInput';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';

type SortType = 'asc' | 'desc' | undefined | null;

const statusColors: { [key: string]: 'success' | 'error' | 'warning' | 'info' | 'primary' } = {
  Completed: 'success',
  Canceled: 'error',
  Pending: 'warning',
  New: 'info',
  default: 'primary'
};

const OrderTableServerSide = () => {
  const router = useRouter();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [sort, setSort] = useState<SortType>('asc');
  const [sortColumn, setSortColumn] = useState<string>('firstname');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);

  const [startDateRange, setStartDateRange] = useState<Date | null>(null);
  const [endDateRange, setEndDateRange] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const fetchTableData = useCallback(async () => {
    setIsLoading(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get('/api/orders', {
          params: {
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            sort,
            sortColumn,
            searchText,
            fromDate: startDateRange ? startDateRange.toISOString() : null,
            toDate: endDateRange ? endDateRange.toISOString() : null
          }
        });

        const updatedRows = response.data.data.map((row: any) => ({
          ...row,
          id: row.orderid
        }));

        setRows(updatedRows);
        setTotal(response.data.count);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 600);
  }, [paginationModel, sort, sortColumn, searchText, startDateRange, endDateRange]);

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort);
      setSortColumn(newModel[0].field);
    } else {
      setSort('asc');
      setSortColumn('firstname');
    }
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleGoClick = () => {
    setStartDateRange(tempStartDate);
    setEndDateRange(tempEndDate);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'orderno',
      headerName: 'Order Number',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.orderno}
        </Typography>
      )
    },
    {
      flex: 0.25,
      minWidth: 230,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body1" sx={{ color: 'text.primary' }}>
          {params.row.firstname} {params.row.lastname}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 150,
      headerName: 'Order Date',
      field: 'orderdate',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body1' sx={{ color: 'text.primary' }}>
          {moment(params.row.orderdate).format('DD-MM-YYYY')}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'orderstatus',
      headerName: 'Status',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.orderstatus || 'Unknown'}
          color={statusColors[params.row.orderstatus] || statusColors.default}
          sx={{
            height: 24,
            textTransform: 'capitalize',
            '& .MuiChip-label': { fontWeight: 500 }
          }}
        />
      )
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={() => router.push(`/app/orders/edit?orderid=${params.row.orderid}`)}
          >
            Edit
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Delete
          </Button>
        </Box>
      )
    }
  ];

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleResetFilters = () => {
    setSearchText('');
    setTempStartDate(null);
    setTempEndDate(null);
    setStartDateRange(null);
    setEndDateRange(null);
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  return (
    <Card>
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
            Orders
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Search, filter, and manage your orders in one place.
          </Typography>
        </Box>
        <Box display='flex' gap={2} flexWrap='wrap'>
          <Button variant='outlined' onClick={handleResetFilters}>
            Reset filters
          </Button>
          <Button
            variant='contained'
            startIcon={<Icon icon='mdi:plus' />}
            onClick={() => router.push('/app/orders/create')}
          >
            Create order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={6} sx={{ px: 5, py: 3, alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid item>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DatePicker
              isClearable
              selectsRange
              monthsShown={2}
              endDate={tempEndDate}
              selected={tempStartDate}
              startDate={tempStartDate}
              shouldCloseOnSelect={false}
              id='date-range-picker-months'
              onChange={(dates: [Date | null, Date | null]) => {
                const [start, end] = dates;
                setTempStartDate(start);
                setTempEndDate(end);
              }}
              customInput={
                <CustomInput
                  //@ts-ignore
                  dates={[tempStartDate, tempEndDate]}
                  setDates={(dates: React.SetStateAction<Date | null>[]) => {
                    setTempStartDate(dates[0]);
                    setTempEndDate(dates[1]);
                  }}
                  label='Invoice Date'
                  end={tempEndDate as Date}
                  start={tempStartDate as Date}
                />
              }
            />
            <Button variant='contained' onClick={handleGoClick}>
              Go
            </Button>
          </Box>
        </Grid>
      </Grid>

      <DataGrid
        autoHeight
        loading={isLoading}
        columns={columns}
        rows={rows}
        getRowId={row => row.orderid}
        rowCount={total}
        pageSizeOptions={[7, 10, 25, 50]}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={handleSortModel}
        slots={{ toolbar: QuickSearchToolbar }}
        slotProps={{
          baseButton: {
            variant: 'outlined',
            color: 'primary'
          },
          toolbar: {
            value: searchText,
            clearSearch: () => handleSearch({ target: { value: '' } } as ChangeEvent<HTMLInputElement>),
            onChange: handleSearch
          }
        }}
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: '1.125rem'
          }
        }}
      />

      <DialougeComponent open={open} setOpen={setOpen} onDelete={() => alert('Delete function here')} />
    </Card>
  );
};

export default OrderTableServerSide;
