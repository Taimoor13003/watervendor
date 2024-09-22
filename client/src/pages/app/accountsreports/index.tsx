import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

interface Account {
  accountcode: string;
  accountname: string;
}

interface Voucher {
  id: number;
  paymentmode: string; // Ensure this matches the API response
}

const AccountAndVoucherPage = () => {
  const [accountCode, setAccountCode] = useState<string>('');
  const [voucherType, setVoucherType] = useState<number | ''>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ accounts: Account[] }>('/api/accountnames');
        setAccounts(response.data.accounts);

        const voucherResponse = await axios.get<{ vouchers: Voucher[] }>('/api/vouchersdropdown');
        console.log('Vouchers fetched:', voucherResponse.data.vouchers); // Debug log
        setVouchers(voucherResponse.data.vouchers);
      } catch (error) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          onChange={(e) => setVoucherType(e.target.value as number)}
          label="Voucher Type"
          required
        >
          {vouchers.map((voucher) => (
            <MenuItem key={voucher.id} value={voucher.id}>
              {voucher.paymentmode} {/* Ensure correct field here */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default AccountAndVoucherPage;
