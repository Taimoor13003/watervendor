// ** React Imports
import { useState, useEffect, forwardRef } from 'react';

// ** Next Import
// import Link from 'next/link';

// ** MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId} from '@mui/x-data-grid';
import { Button } from '@mui/material';


import format from 'date-fns/format';
import DatePicker from 'react-datepicker';

import { useDispatch} from 'react-redux';
import { fetchData } from 'src/store/apps/invoice';

import { AppDispatch } from 'src/store';
import { InvoiceType } from 'src/types/apps/invoiceTypes';
import { DateType } from 'src/types/forms/reactDatepickerTypes';
import CustomTextField from 'src/@core/components/mui/text-field';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import Header from 'src/pages/app/customerinvoice/Header';


interface CustomInputProps {
  dates: Date[];
  label: string;
  end: number | Date;
  start: number | Date;
  setDates?: (value: Date[]) => void;
}

interface CellType {
  row: InvoiceType;
}




const CustomInput = forwardRef((props: CustomInputProps, ref) => {
  const startDate = props.start !== null ? format(props.start, 'MM/dd/yyyy') : '';
  const endDate = props.end !== null ? ` - ${format(props.end, 'MM/dd/yyyy')}` : null;

  const value = `${startDate}${endDate !== null ? endDate : ''}`;
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null;
  const updatedProps = { ...props };
  delete updatedProps.setDates;

  return <CustomTextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />;
});
/* eslint-enable */

const InvoiceList = ({ data }: { data: any[] }) => {
  // ** State
  const [dates, setDates] = useState<Date[]>([]);
  const [value, setValue] = useState<string>('');
  const [statusValue, setStatusValue] = useState<string>('');
  const [endDateRange, setEndDateRange] = useState<DateType>(null);
  const [selectedRows] = useState<GridRowId[]>([]);
  const [startDateRange, setStartDateRange] = useState<DateType>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<any[]>([]);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(
      fetchData({
        dates,
        q: value,
        status: statusValue
      })
    );
  }, [dispatch, statusValue, value, dates]);

  useEffect(() => {
    // Check if data is ready
    const dataReady = selectedRowIds.length > 0 && startDateRange && endDateRange;
    setIsDataReady(dataReady);
  }, [selectedRowIds, startDateRange, endDateRange]);

  const handleFilter = (val: string) => {
    setValue(val);
  };

  const handleStatusValue = (e: SelectChangeEvent<unknown>) => {
    setStatusValue(e.target.value as string);
  };

  const handleOnChangeRange = (dates: any) => {
    const [start, end] = dates;
    if (start !== null && end !== null) {
      setDates(dates);
    }
    setStartDateRange(start);
    setEndDateRange(end);
  };

  const onRowsSelectionHandler = (ids: GridRowId[]) => {
    const selectedRowsData = ids.map((id: GridRowId) => data.find((row) => row.id === id).customerid);
    setSelectedRowIds(selectedRowsData);
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: CellType) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Replace with your avatar logic */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {params.row.firstname + " " + params.row.middlename + " " + params.row.lastname}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'customertype',
      headerName: 'Customer Type',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.customertype}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Payment Mode',
      field: 'paymentmode',
      valueGetter: params => new Date(params.value),
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.paymentmode}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Telephone (Delivery)',
      field: 'telephoneres',
      valueGetter: params => new Date(params.value),
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.telephoneres}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Telephone (Office)',
      field: 'telephoneoffice',
      valueGetter: params => new Date(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.telephoneoffice}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'actions',
      headerName: 'Actions',
      renderCell: () => (
        <Box display="flex" gap={3}>
          <Button variant='contained'>
            Edit
          </Button>
          <Button variant='contained'>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Filter Customer Invoice' />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Invoice Status'
                    SelectProps={{ value: statusValue, onChange: e => handleStatusValue(e) }}
                  >
                    <MenuItem value=''>None</MenuItem>
                    <MenuItem value='downloaded'>Downloaded</MenuItem>
                    <MenuItem value='draft'>Draft</MenuItem>
                    <MenuItem value='paid'>Paid</MenuItem>
                    <MenuItem value='partial payment'>Partial Payment</MenuItem>
                    <MenuItem value='past due'>Past Due</MenuItem>
                    <MenuItem value='sent'>Sent</MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    isClearable
                    selectsRange
                    monthsShown={2}
                    endDate={endDateRange}
                    selected={startDateRange}
                    startDate={startDateRange}
                    shouldCloseOnSelect={false}
                    id='date-range-picker-months'
                    onChange={handleOnChangeRange}
                    customInput={
                      <CustomInput
                        dates={dates}
                        setDates={setDates}
                        label='Invoice Date'
                        end={endDateRange as number | Date}
                        start={startDateRange as number | Date}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <Header value={value} selectedRows={selectedRows} handleFilter={handleFilter} selectedRowIds={selectedRowIds} startDate={dates[0]} endDate={dates[1]} isDataReady={isDataReady}    />
            <DataGrid
              autoHeight
              pagination
              rowHeight={62}
              rows={data}
              columns={columns}
              checkboxSelection  
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)}
            />
          </Card>
        </Grid>
      </Grid>
    </DatePickerWrapper>
  );
};

export default InvoiceList;
