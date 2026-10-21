import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Alert, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import format from 'date-fns/format';
import startOfMonth from 'date-fns/startOfMonth';
import DatePicker from 'react-datepicker';

import CustomTextField from 'src/@core/components/mui/text-field';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import Header from 'src/pages/app/customerinvoice/Header';
import { firebaseAuth } from 'src/services/firebase.service';
import { DISPLAY_DATE_FORMAT } from 'src/lib/display-date';

// Laid out like the desktop RMS "Customer Invoice Report": Sales Period From /
// To, then one scrolling list of the customers who still have UNPAID orders in
// that period (paid orders never appear on an invoice), with a search box,
// "Show only Credit Clients" and Select All. Payments are recorded on the
// invoice itself or per order in Edit Order, not here.

type CustomerRow = {
  id: number;
  customerid: number | null;
  firstname?: string | null;
  middlename?: string | null;
  lastname?: string | null;
  customertype?: string | null;
  accountno?: string | null;
  paymentmode?: string | null;
  telephoneres?: string | null;
  telephoneoffice?: string | null;
};

const fullName = (row: CustomerRow) => [row.firstname, row.middlename, row.lastname].filter(Boolean).join(' ');

const InvoiceList = ({ data }: { data: CustomerRow[] }) => {
  // Opens on the current month to date, like the client's usual run.
  const [fromDate, setFromDate] = useState<Date | null>(() => startOfMonth(new Date()));
  const [toDate, setToDate] = useState<Date | null>(() => new Date());
  const [search, setSearch] = useState('');
  const [creditOnly, setCreditOnly] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [unpaidCustomerIds, setUnpaidCustomerIds] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fromParam = fromDate ? format(fromDate, 'yyyy-MM-dd') : '';
  const toParam = toDate ? format(toDate, 'yyyy-MM-dd') : '';
  const rangeValid = Boolean(fromParam && toParam && fromParam <= toParam);

  useEffect(() => {
    setSelectedIds([]);
    if (!rangeValid) {
      setUnpaidCustomerIds(null);

      return;
    }

    let active = true;
    setLoading(true);
    setLoadError(null);

    const load = async () => {
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken();
        const resp = await axios.get('/api/invoice-pending-customers', {
          params: { startDate: fromParam, endDate: toParam },
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        });
        if (active) setUnpaidCustomerIds(Array.isArray(resp.data?.customerIds) ? resp.data.customerIds : []);
      } catch {
        // Never fall back to listing everyone: that would offer paid customers
        // for invoicing.
        if (active) {
          setUnpaidCustomerIds(null);
          setLoadError('Could not load the customers with unpaid orders. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [fromParam, toParam, rangeValid]);

  const rows = useMemo(() => {
    if (!unpaidCustomerIds) return [];
    const unpaid = new Set(unpaidCustomerIds);
    const term = search.trim().toLowerCase();

    return data
      .filter(row => row.customerid !== null && unpaid.has(Number(row.customerid)))
      .filter(row => !creditOnly || String(row.paymentmode || '').toLowerCase() === 'credit')
      .filter(row => {
        if (!term) return true;

        return [fullName(row), row.accountno, row.telephoneres, row.telephoneoffice, row.customertype]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(term));
      })
      .sort((a, b) => fullName(a).localeCompare(fullName(b)));
  }, [data, unpaidCustomerIds, search, creditOnly]);

  const visibleIds = rows.map(row => Number(row.customerid));
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some(id => selectedIds.includes(id));

  const toggleAll = () =>
    setSelectedIds(current =>
      allVisibleSelected ? current.filter(id => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]
    );
  const toggleOne = (id: number) =>
    setSelectedIds(current => (current.includes(id) ? current.filter(value => value !== id) : [...current, id]));

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Customer Invoice' subheader='Customers with unpaid orders in the period (based on invoice date).' />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date: Date | null) => setFromDate(date)}
                    dateFormat={DISPLAY_DATE_FORMAT}
                    customInput={<CustomTextField fullWidth label='Sales Period From' />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    selected={toDate}
                    onChange={(date: Date | null) => setToDate(date)}
                    dateFormat={DISPLAY_DATE_FORMAT}
                    customInput={<CustomTextField fullWidth label='Sales Period To' />}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomTextField
                    fullWidth
                    label='Search customer'
                    placeholder='Name, account #, or phone'
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <Header
              value={search}
              selectedRows={[]}
              handleFilter={setSearch}
              selectedRowIds={selectedIds}
              startDate={fromDate}
              endDate={toDate}
              isDataReady={rangeValid && selectedIds.length > 0}
            />
            <Box sx={{ px: 5, pb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
              <FormControlLabel
                control={<Checkbox checked={creditOnly} onChange={event => setCreditOnly(event.target.checked)} />}
                label='Show only Credit Clients'
              />
              {unpaidCustomerIds ? (
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {rows.length} customer{rows.length === 1 ? '' : 's'}
                  {selectedIds.length ? ` · ${selectedIds.length} selected` : ''}
                </Typography>
              ) : null}
            </Box>
            {!rangeValid ? (
              <Alert severity='info' sx={{ mx: 5, mb: 4 }}>
                Choose a Sales Period From and To date (From on or before To).
              </Alert>
            ) : null}
            {loadError ? (
              <Alert severity='error' sx={{ mx: 5, mb: 4 }}>
                {loadError}
              </Alert>
            ) : null}
            {loading ? (
              <Typography variant='body2' sx={{ px: 5, pb: 4, color: 'text.secondary' }}>
                Loading customers with unpaid orders…
              </Typography>
            ) : null}

            {/* Every customer in one scrolling list, no pages, like the desktop. */}
            <TableContainer sx={{ maxHeight: '65vh' }}>
              <Table stickyHeader size='small' aria-label='Customers with unpaid orders'>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={allVisibleSelected}
                        indeterminate={!allVisibleSelected && someVisibleSelected}
                        onChange={toggleAll}
                        disabled={!rows.length}
                        inputProps={{ 'aria-label': 'Select all' }}
                      />
                    </TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Customer Type</TableCell>
                    <TableCell>Account #</TableCell>
                    <TableCell>Payment Mode</TableCell>
                    <TableCell>Telephone (Delivery)</TableCell>
                    <TableCell>WhatsApp Number</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => {
                    const id = Number(row.customerid);
                    const checked = selectedIds.includes(id);

                    return (
                      <TableRow key={row.id} hover selected={checked} onClick={() => toggleOne(id)} sx={{ cursor: 'pointer' }}>
                        <TableCell padding='checkbox'>
                          <Checkbox checked={checked} inputProps={{ 'aria-label': `Select ${fullName(row)}` }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{fullName(row)}</TableCell>
                        <TableCell>{row.customertype}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.accountno}</TableCell>
                        <TableCell>{row.paymentmode}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.telephoneres}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.telephoneoffice}</TableCell>
                      </TableRow>
                    );
                  })}
                  {unpaidCustomerIds && !loading && rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        {search ? 'No customer matches this search.' : 'No customers have unpaid orders in this period.'}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </DatePickerWrapper>
  );
};

export default InvoiceList;
