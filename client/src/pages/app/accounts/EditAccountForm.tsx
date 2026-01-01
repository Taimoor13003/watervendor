import React, { useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CustomTextField from 'src/@core/components/mui/text-field';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';

type FormValues = {
  accountid?: number;
  id?: number;
  accountcode: string;
  accountname: string;
  accounttype: number | string;
  openingbalance: number | string;
  remarks: string | null;
};

type EditAccountFormProps = {
  accountData: FormValues | null;
};

const accountTypeOptions = [
  { label: 'Income', value: 1 },
  { label: 'Expense', value: 2 },
  { label: 'Liability', value: 4 },
];

const schema = yup.object().shape({
  accountcode: yup
    .number()
    .typeError('Account code must be a number')
    .required('Account code is required'),
  accountname: yup.string().required('Account name is required'),
  accounttype: yup
    .number()
    .typeError('Account type is required')
    .oneOf([1, 2, 4], 'Select Income, Expense, or Liability'),
  openingbalance: yup
    .number()
    .typeError('Opening balance must be a number')
    .required('Opening balance is required')
    .min(0, 'Balance cannot be negative'),
  remarks: yup.string().optional(),
});

const EditAccountForm = ({ accountData }: EditAccountFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }} = useForm<FormValues>({
    defaultValues: accountData || undefined,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const toNumberOrNull = (val: any) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  };

  const onSubmit = async (data: FormValues) => {
    const accountId = data.accountid || data.id;
    if (!accountId) {
      toast.error('Missing account id');
      return;
    }

    const payload = {
      id: accountId,
      accountcode: toNumberOrNull(data.accountcode),
      accounttype: toNumberOrNull(data.accounttype),
      accountname: data.accountname,
      openingbalance: toNumberOrNull(data.openingbalance),
      remarks: data.remarks,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/accounts-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update account');
      }
      toast.success('Account updated');
      router.push('/app/accounts');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title='Edit Account Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='accountcode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Account Code'
                    type='number'
                    placeholder='Enter account code'
                    error={Boolean(errors.accountcode)}
                    helperText={errors.accountcode?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='accountname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Account Name'
                    placeholder='Enter account name'
                    error={Boolean(errors.accountname)}
                    helperText={errors.accountname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='openingbalance'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Opening Balance'
                    type='number'
                    placeholder='Enter opening balance'
                    error={Boolean(errors.openingbalance)}
                    helperText={errors.openingbalance?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='accounttype'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Account Type'
                    placeholder='Select account type'
                    error={Boolean(errors.accounttype)}
                    helperText={errors.accounttype?.message || 'Income (1), Expense (2), Liability (4)'}
                    {...field}
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
            <Grid item xs={12}>
              <Controller
                name='remarks'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Remarks'
                    placeholder='Enter remarks'
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditAccountForm;
