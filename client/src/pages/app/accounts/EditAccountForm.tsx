import React from 'react';
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

type FormValues = {
  accountcode: string;
  accountname: string;
  accounttype: number;
  openingbalance: number;
  remarks: string;
};

type EditAccountFormProps = {
  accountData: FormValues;
};

const schema = yup.object().shape({
  accountcode: yup.string().required('Account code is required'),
  accountname: yup.string().required('Account name is required'),
  accounttype: yup.number().required('Account type is required'),
  openingbalance: yup.number().required('Opening balance is required').min(0, 'Balance cannot be negative'),
  remarks: yup.string().optional(),
});

const EditAccountForm = ({ accountData }: EditAccountFormProps) => {
  const { control, handleSubmit, formState: { errors }} = useForm<FormValues>({
    defaultValues: accountData,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    toast.success('Form Submitted');
    console.log(data);
  };

  console.log(accountData, "data");

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
                    fullWidth
                    label='Account Type'
                    type='number'
                    placeholder='Enter opening balance'
                    error={Boolean(errors.accounttype)}
                    helperText={errors.accounttype?.message}
                    {...field}
                  />
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
              <Button type='submit' variant='contained'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditAccountForm;
