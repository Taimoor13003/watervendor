import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import AccountDetailsTable from 'src/views/orders/table/AccountDetailsTable';

interface Account {
  accountcode: string;
  accountname: string;
}

interface Voucher {
  id: number;
  paymentmode: string;
}

interface RowData {
  id: number;
  voucherno: string;
  accountcode: string;
  voucherdate: string;
  debitamount: number;
  creditamount: number;
}

const AccountAndVoucherPage = () => {
  const [accountCode, setAccountCode] = useState<string>('');
  const [voucherType, setVoucherTypeValue] = useState<number | ''>('');
  const [voucherPeriodFrom, setVoucherPeriodFrom] = useState<string>('');
  const [voucherPeriodTo, setVoucherPeriodTo] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accountDetails, setAccountDetails] = useState<RowData[]>([]); // State to store fetched account details
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const accountResponse = await axios.get<{ accounts: Account[] }>('/api/accountnames');
        setAccounts(accountResponse.data.accounts);
        const voucherResponse = await axios.get<{ vouchers: Voucher[] }>('/api/vouchersdropdown');
        setVouchers(voucherResponse.data.vouchers);
      } catch (error) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(''); // Clear previous error messages
    try {
      const response = await axios.get<{ result: RowData[] }>('/api/accountdetails', {
        params: {
          accountcode: accountCode,
          vouchertype: voucherType,
          voucherperiodfrom: voucherPeriodFrom,
          voucherperiodto: voucherPeriodTo,
        },
      });
      setAccountDetails(response.data.result); // Store the result in state
    } catch (error) {
      setError('Failed to fetch data from account details API.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FormControl fullWidth margin="normal">
        <InputLabel id="accountcode-label">Account Name</InputLabel>
        <Select
          labelId="accountcode-label"
          value={accountCode}
          onChange={(e) => setAccountCode(e.target.value as string)}
          label="Account Name"
          required
        >
          {accounts.map((account) => (
            <MenuItem key={account.accountcode} value={account.accountcode}>
              {account.accountname}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="vouchertype-label">Voucher Type</InputLabel>
        <Select
          labelId="vouchertype-label"
          value={voucherType}
          onChange={(e) => setVoucherTypeValue(e.target.value as number)}
          label="Voucher Type"
          required
        >
          {vouchers.map((voucher) => (
            <MenuItem key={voucher.id} value={voucher.id}>
              {voucher.paymentmode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Voucher Period From"
        type="date"
        value={voucherPeriodFrom}
        onChange={(e) => setVoucherPeriodFrom(e.target.value)}
        InputLabelProps={{ shrink: true }}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Voucher Period To"
        type="date"
        value={voucherPeriodTo}
        onChange={(e) => setVoucherPeriodTo(e.target.value)}
        InputLabelProps={{ shrink: true }}
        margin="normal"
        required
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Submit'}
      </Button>

      {error && <p>{error}</p>}

      {accountDetails.length > 0 && <AccountDetailsTable data={accountDetails} />}
    </div>
  );
};

export default AccountAndVoucherPage;
