// src/views/apps/invoice/AccountForm.tsx
import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Icon from 'src/@core/components/icon';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CustomTextField from 'src/@core/components/mui/text-field';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';

type FormValues = {
  accountCode: number | string;
  accountType: number | string;
  accountName: string;
  openingBalance: number | string;
  remarks: string;
  isactive: boolean;
};

const accountTypeOptions = [
  { label: 'Income', value: 1 },
  { label: 'Expense', value: 2 },
  { label: 'Liability', value: 4 },
];

const schema = yup.object().shape({
  accountCode: yup
    .number()
    .typeError('Account Code must be a number')
    .moreThan(0, 'Account Code must be greater than 0')
    .required('Account Code is required'),
  accountType: yup
    .number()
    .typeError('Account Type must be a number')
    .oneOf([1, 2, 4], 'Select Income, Expense, or Liability')
    .required('Account Type is required'),
  accountName: yup
    .string()
    .trim()
    .required('Account Name is required'),
  openingBalance: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Opening Balance cannot be negative')
    .required('Opening Balance is required'),
  remarks: yup.string().trim().max(500, 'Max 500 characters'),
  isactive: yup.boolean(),
});

const AccountForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: {
      accountCode: '',
      accountType: '',
      accountName: '',
      openingBalance: '',
      remarks: '',
      isactive: true,
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const toNumberOrNull = (val: any) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const codeNum = toNumberOrNull(data.accountCode);
    const typeNum = toNumberOrNull(data.accountType);
    if (codeNum === null || typeNum === null) {
      toast.error('Account code and type must be numbers');
      setLoading(false);
      return;
    }
    const payload = {
      accountcode: String(codeNum),
      accounttype: typeNum,
      accountname: data.accountName.trim(),
      openingbalance: toNumberOrNull(data.openingBalance),
      remarks: data.remarks?.trim() ?? '',
    };

    try {
      const res = await fetch('/api/accounts-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to create account');
      }

      toast.success('Account created');
      reset();
      router.push('/app/accounts');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
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
        <Box display='flex' alignItems='center' gap={1}>
          <Icon icon='mdi:bank-outline' />
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              Create Account
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Add a new ledger account with opening balance.
            </Typography>
          </Box>
        </Box>
        <Button variant='outlined' onClick={() => router.push('/app/accounts')}>
          Back to accounts
        </Button>
      </Box>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant='h6'>Basics</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='accountCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account Code (number)'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.accountCode)}
                    helperText={errors.accountCode?.message || 'Numeric ledger code, e.g. 1001'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='accountType'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Account Type'
                    SelectProps={{ displayEmpty: true }}
                    error={Boolean(errors.accountType)}
                    helperText={errors.accountType?.message || 'Pick Income, Expense, or Liability'}
                  >
                    <MenuItem disabled value=''>
                      <em>Select type</em>
                    </MenuItem>
                    {accountTypeOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='accountName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Account Name'
                    placeholder='e.g. Cash'
                    error={Boolean(errors.accountName)}
                    helperText={errors.accountName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='openingBalance'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Opening Balance'
                    placeholder='0.00'
                    type='number'
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.openingBalance)}
                    helperText={errors.openingBalance?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6'>Notes</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='remarks'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Remarks / Note'
                    placeholder='Optional'
                    multiline
                    minRows={3}
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name='isactive'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onChange={(_, v) => field.onChange(v)}
                      />
                    )}
                  />
                }
                label='Active'
              />
            </Grid>

            <Grid item xs={12}>
              <Box display='flex' gap={2}>
                <Button type='submit' variant='contained' disabled={loading}>
                  {loading ? 'Saving...' : 'Save Account'}
                </Button>
                <Button variant='outlined' onClick={() => router.push('/app/accounts')}>
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

export default AccountForm;
