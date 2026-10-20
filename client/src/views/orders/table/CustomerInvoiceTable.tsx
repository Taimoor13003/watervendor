import { useState, useEffect, forwardRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowId} from '@mui/x-data-grid';
import { Alert, Button, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';


import format from 'date-fns/format';
import DatePicker from 'react-datepicker';

import { InvoiceType } from 'src/types/apps/invoiceTypes';
import { DateType } from 'src/types/forms/reactDatepickerTypes';
import CustomTextField from 'src/@core/components/mui/text-field';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import Header from 'src/pages/app/customerinvoice/Header';
import { firebaseAuth } from 'src/services/firebase.service';
import { DISPLAY_DATE_FORMAT } from 'src/lib/display-date';


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
  const startDate = props.start !== null ? format(props.start, DISPLAY_DATE_FORMAT) : '';
  const endDate = props.end !== null ? ` - ${format(props.end, DISPLAY_DATE_FORMAT)}` : null;

  const value = `${startDate}${endDate !== null ? endDate : ''}`;
  props.start === null && props.dates.length && props.setDates ? props.setDates([]) : null;
  const updatedProps = { ...props };
  delete updatedProps.setDates;

  return <CustomTextField fullWidth inputRef={ref} {...updatedProps} label={props.label || ''} value={value} />;
});

const InvoiceList = ({ data }: { data: any[] }) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [value, setValue] = useState<string>('');
  const [statusValue, setStatusValue] = useState<string>('');
  const [endDateRange, setEndDateRange] = useState<DateType>(null);
  const [selectedRows] = useState<GridRowId[]>([]);
  const [startDateRange, setStartDateRange] = useState<DateType>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [selectedRowIds, setSelectedRowIds] = useState<any[]>([]);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // Customers who still owe money for the selected range. Customers who already
  // paid are hidden so only outstanding invoices get printed.
  const [pendingCustomerIds, setPendingCustomerIds] = useState<number[] | null>(null);
  const [pendingLoading, setPendingLoading] = useState<boolean>(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [showPaidCustomers, setShowPaidCustomers] = useState<boolean>(false);
  const [pendingRefresh, setPendingRefresh] = useState<number>(0);
  const [savingPayment, setSavingPayment] = useState<boolean>(false);

  useEffect(() => {
    const dataReady : any = selectedRowIds.length > 0 && startDateRange && endDateRange;
    setIsDataReady(dataReady);
  }, [selectedRowIds, startDateRange, endDateRange]);

  const rangeStartParam = startDateRange ? format(startDateRange, 'yyyy-MM-dd') : '';
  const rangeEndParam = endDateRange ? format(endDateRange, 'yyyy-MM-dd') : '';

  useEffect(() => {
    if (!rangeStartParam || !rangeEndParam) {
      setPendingCustomerIds(null);
      setPendingError(null);

      return;
    }

    let active = true;
    setPendingLoading(true);
    setPendingError(null);

    const loadPendingCustomers = async () => {
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken();
        const resp = await axios.get('/api/invoice-pending-customers', {
          params: { startDate: rangeStartParam, endDate: rangeEndParam },
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        });
        if (!active) return;
        setPendingCustomerIds(Array.isArray(resp.data?.customerIds) ? resp.data.customerIds : []);
      } catch (error) {
        if (!active) return;
        // Fail open: showing every customer is better than hiding customers who
        // do owe money because a request failed.
        setPendingCustomerIds(null);
        setPendingError('Could not check which customers have already paid, so every customer is listed.');
      } finally {
        if (active) setPendingLoading(false);
      }
    };

    loadPendingCustomers();

    return () => {
      active = false;
    };
  }, [rangeStartParam, rangeEndParam, pendingRefresh]);

  // Desktop "Payment Received": marks every order invoiced in the selected range
  // as paid, which removes the customer from this list for that period.
  const recordPayment = async (customerIds: number[], received: boolean) => {
    if (!rangeStartParam || !rangeEndParam || !customerIds.length) return

    const period = `${format(startDateRange as Date, 'dd/MM/yyyy')} to ${format(endDateRange as Date, 'dd/MM/yyyy')}`
    const who = customerIds.length === 1 ? 'this customer' : `${customerIds.length} customers`
    const question = received
      ? `Mark ${who} as PAID for ${period}? They will no longer appear in the invoice list for this period.`
      : `Mark ${who} as NOT PAID for ${period}?`
    if (!window.confirm(question)) return

    setSavingPayment(true)
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      const resp = await axios.post(
        '/api/payment-received',
        { customerIds, startDate: rangeStartParam, endDate: rangeEndParam, received },
        { headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined }
      );
      const updated = Number(resp.data?.updated ?? 0)
      toast.success(
        received
          ? `Payment recorded (${updated} order${updated === 1 ? '' : 's'} marked paid).`
          : `Marked as not paid (${updated} order${updated === 1 ? '' : 's'}).`
      )
      setPendingRefresh(count => count + 1)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Could not record the payment. Please try again.')
    } finally {
      setSavingPayment(false)
    }
  };

  const hidingPaidCustomers = !showPaidCustomers && pendingCustomerIds !== null;

  const visibleRows = hidingPaidCustomers
    ? data.filter(row => pendingCustomerIds.includes(Number(row.customerid)))
    : data;

  const hiddenCustomerCount = data.length - visibleRows.length;

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
    const selectedRowsData = ids
      .map((id: GridRowId) => data.find((row) => row.id === id)?.customerid)
      .filter((customerid) => customerid !== undefined && customerid !== null);
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
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {[params.row.firstname, params.row.middlename, params.row.lastname].filter(Boolean).join(' ')}
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
      minWidth: 120,
      headerName: 'Payment Mode',
      field: 'paymentmode',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.paymentmode}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'Telephone (Delivery)',
      field: 'telephoneres',
      renderCell: (params: CellType) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.telephoneres}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'WhatsApp Number',
      field: 'telephoneoffice',
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
      headerName: 'Payment',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        if (!rangeStartParam || !rangeEndParam) {
          return (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Select a date range
            </Typography>
          );
        }

        const customerId = Number(params.row.customerid);
        const owes = pendingCustomerIds === null || pendingCustomerIds.includes(customerId);

        return owes ? (
          <Button
            variant='contained'
            size='small'
            color='success'
            disabled={savingPayment}
            onClick={() => recordPayment([customerId], true)}
          >
            Payment Received
          </Button>
        ) : (
          <Button
            variant='outlined'
            size='small'
            disabled={savingPayment}
            onClick={() => recordPayment([customerId], false)}
          >
            Undo (mark unpaid)
          </Button>
        );
      },
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
            <Box sx={{ px: 5, pb: 2 }}>
              {rangeStartParam && rangeEndParam && selectedRowIds.length > 0 ? (
                <Button
                  variant='contained'
                  color='success'
                  size='small'
                  sx={{ mb: 2 }}
                  disabled={savingPayment}
                  onClick={() => recordPayment(selectedRowIds.map(Number), true)}
                >
                  Payment Received for {selectedRowIds.length} selected
                </Button>
              ) : null}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showPaidCustomers}
                    onChange={(event) => setShowPaidCustomers(event.target.checked)}
                  />
                }
                label='Show customers who already paid for this period'
              />
              {pendingLoading ? (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Checking which customers still have unpaid invoices…
                </Typography>
              ) : null}
              {pendingError ? (
                <Alert severity='warning' sx={{ mt: 2 }}>
                  {pendingError}
                </Alert>
              ) : null}
              {hidingPaidCustomers && hiddenCustomerCount > 0 ? (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {hiddenCustomerCount} customer{hiddenCustomerCount === 1 ? '' : 's'} hidden — already paid, or no
                  orders in this date range.
                </Typography>
              ) : null}
              {!startDateRange || !endDateRange ? (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Select an invoice date range to hide customers who have already paid.
                </Typography>
              ) : null}
            </Box>
            <DataGrid
              autoHeight
              pagination
              rowHeight={62}
              rows={visibleRows}
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
