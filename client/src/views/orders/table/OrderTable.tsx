import React, { useState, useCallback, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomInput from './DatePicker/CustomInput';
import DialougeComponent from './DialougeComponent';
import moment from 'moment';
import axios from 'axios';
import { Card } from '@mui/material';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';

type SortType = 'asc' | 'desc' | undefined | null;

const OrderTableServerSide = () => {
  const router = useRouter();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [sort, setSort] = useState<SortType>('asc');
  const [sortColumn, setSortColumn] = useState<string>('firstname');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [startDateRange, setStartDateRange] = useState<Date | null>(null);
  const [endDateRange, setEndDateRange] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const fetchTableData = useCallback(async () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get('/api/orders', {
          params: {
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            sort: sort || 'asc',
            sortColumn: sortColumn || 'firstname',
            searchText: searchText,
            fromDate: startDateRange ? startDateRange.toISOString() : null,
            toDate: endDateRange ? endDateRange.toISOString() : null,
          },
        });
        const updatedRows = response.data.data.map((row: any) => ({
          ...row,
          id: row.orderid,
        }));
        setRows(updatedRows);
        setTotal(response.data.count);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }, 1200);
  }, [paginationModel.page, paginationModel.pageSize, sort, sortColumn, searchText, startDateRange, endDateRange]);

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort);
      setSortColumn(newModel[0].field);
    } else {
      setSort('asc');
      setSortColumn('firstname');
    }
  };

  // const handleSearch = (searchValue: string) => {
  //   setSearchText(searchValue);
  //   setPaginationModel(prev => ({ ...prev, page: 0 }));
  // };

  const handleGoClick = () => {
    setStartDateRange(tempStartDate);
    setEndDateRange(tempEndDate);
    fetchTableData(); // Trigger data fetch with updated dates
  };

  const onDelete = () => {
    alert('Delete Function');
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'orderno',
      headerName: 'Order Number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {params.row.orderno}
            </Typography>
            <Typography noWrap variant='caption'>
              {params.row.orderno}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.firstname} {params.row.lastname}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Order Date',
      field: 'orderdate',
      valueGetter: params => new Date(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {moment(params.row.orderdate).format('DD-MM-YYYY')}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => (
        <Box display='flex' gap={3}>
          <Button variant='contained' onClick={() => router.push(`/app/orders/edit?orderid=${params.row.orderid}`)}>
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
      <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
        <Box>
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
          <Button variant='contained' onClick={handleGoClick}>Go</Button>
        </Box>
        <Box>
          <Fab color='primary' variant='extended' onClick={() => router.push('/app/orders/create')}>
            Create New Order
          </Fab>
        </Box>
      </Grid>
      <DataGrid
        autoHeight
        columns={columns}
        pageSizeOptions={[7, 10, 25, 50]}
        paginationModel={paginationModel}
        rowCount={total}
        paginationMode='server'
        sortingMode='server'
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={handleSortModel}
        rows={rows}
        getRowId={row => row.orderid}
        sx={{
          '& .MuiSvgIcon-root': {
            fontSize: '1.125rem',
          },
        }}
        slots={{
          toolbar: QuickSearchToolbar,
        }}
        slotProps={{
          baseButton: {
            variant: 'outlined',
            color: 'primary',
            onClick: () => router.push('/app/orders/create'),
          },
        }}
      />
      <DialougeComponent open={open} setOpen={setOpen} onDelete={onDelete} />
    </Card>
  );
};

export default OrderTableServerSide;


