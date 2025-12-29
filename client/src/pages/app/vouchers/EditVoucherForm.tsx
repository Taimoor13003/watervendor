import React, { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { vouchertypes } from 'src/constant';

type Voucher = {
  voucheramount: number | null;
  description: string | null;
  vouchertype: number | null;
  voucherno: number | null;
  id: number;
  voucherdate: string | Date | null;
};

type VoucherTrans = {
  id: number;
  voucherno: number | null;
  accountcode: string | null;
  chqno: string | null;
  debitamount: number | null;
  creditamount: number | null;
};

type VoucherProps = {
  vouchers: Voucher[];
  vouchertrans: VoucherTrans[];
};

const schema = yup.object().shape({
  description: yup.string().required('Description is required'),
  vouchertype: yup.number().typeError('Voucher type is required').required('Voucher type is required'),
  voucherno: yup.number().typeError('Voucher number is required').required('Voucher number is required'),
  voucheramount: yup.number().typeError('Amount must be a number').required('Amount is required'),
  voucherDate: yup.date().nullable().required('Voucher date is required'),
  accountcode: yup.string().required('Account code is required'),
  chqno: yup.string().required('Cheque no is required'),
  debitamount: yup.number().typeError('Debit must be a number').required('Debit amount is required'),
  creditamount: yup.number().typeError('Credit must be a number').required('Credit amount is required'),
});

const EditVoucherForm = ({ vouchers, vouchertrans }: VoucherProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<{ accountcode: string; accountname: string }[]>([]);

  const voucher = vouchers[0] || {
    voucheramount: 0,
    description: '',
    vouchertype: 0,
    voucherno: 0,
    id: 0,
    voucherdate: null,
  };

  const voucherTransaction = vouchertrans[0] || {
    accountcode: '',
    chqno: '',
    debitamount: 0,
    creditamount: 0,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      description: voucher.description ?? '',
      vouchertype: voucher.vouchertype ?? 0,
      voucherno: voucher.voucherno ?? 0,
      voucheramount: voucher.voucheramount ?? 0,
      voucherDate: voucher.voucherdate ? new Date(voucher.voucherdate) : null,
      accountcode: voucherTransaction.accountcode ?? '',
      chqno: voucherTransaction.chqno ?? '',
      debitamount: voucherTransaction.debitamount ?? 0,
      creditamount: voucherTransaction.creditamount ?? 0,
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetch('/api/accountnames')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.accounts)) {
          setAccounts(data.accounts);
        } else {
          setAccounts([]);
        }
      })
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    reset({
      description: voucher.description ?? '',
      vouchertype: voucher.vouchertype ?? 0,
      voucherno: voucher.voucherno ?? 0,
      voucheramount: voucher.voucheramount ?? 0,
      voucherDate: voucher.voucherdate ? new Date(voucher.voucherdate) : null,
      accountcode: voucherTransaction.accountcode ?? '',
      chqno: voucherTransaction.chqno ?? '',
      debitamount: voucherTransaction.debitamount ?? 0,
      creditamount: voucherTransaction.creditamount ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucher.id]);

  const typeOptions = useMemo(() => vouchertypes, []);

  const toNumberOrNull = (value: any) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);
    const payload = {
      voucherid: voucher.id,
      voucherno: voucher.voucherno,
      description: formData.description,
      vouchertype: formData.vouchertype,
      voucherdate: formData.voucherDate,
      voucheramount: toNumberOrNull(formData.voucheramount),
      accountcode: formData.accountcode,
      chqno: formData.chqno,
      debitamount: toNumberOrNull(formData.debitamount),
      creditamount: toNumberOrNull(formData.creditamount),
    };

    try {
      const res = await fetch('/api/voucher-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update voucher');
      }

      toast.success('Voucher updated');
      router.push('/app/vouchers');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Edit Voucher" subheader="Update voucher details and transaction." />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h6">Voucher Details</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="voucherno"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Voucher Number"
                    placeholder="Voucher Number"
                    type="number"
                    disabled
                    error={Boolean(errors.voucherno)}
                    helperText={errors.voucherno?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="vouchertype"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.vouchertype)}>
                    <InputLabel>Voucher Type</InputLabel>
                    <Select {...field} label="Voucher Type">
                      {typeOptions.map(t => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.vouchertype?.message as string}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Description"
                    placeholder="Description"
                    multiline
                    minRows={2}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="voucheramount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Amount"
                    placeholder="Amount"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.voucheramount)}
                    helperText={errors.voucheramount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="voucherDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Voucher Date"
                    dateFormat="yyyy-MM-dd"
                    customInput={
                      <TextField
                        fullWidth
                        label="Voucher Date"
                        error={Boolean(errors.voucherDate)}
                        helperText={errors.voucherDate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Voucher Transaction</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="accountcode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.accountcode)}>
                    <InputLabel>Account Code</InputLabel>
                    <Select {...field} label="Account Code">
                      {accounts.map(acc => (
                        <MenuItem key={acc.accountcode} value={acc.accountcode}>
                          {acc.accountcode} – {acc.accountname}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.accountcode?.message as string}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="chqno"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cheque Number"
                    placeholder="Cheque Number"
                    error={Boolean(errors.chqno)}
                    helperText={errors.chqno?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="debitamount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Debit Amount"
                    placeholder="Debit Amount"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.debitamount)}
                    helperText={errors.debitamount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="creditamount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Credit Amount"
                    placeholder="Credit Amount"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.creditamount)}
                    helperText={errors.creditamount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" onClick={() => router.push('/app/vouchers')}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditVoucherForm;
