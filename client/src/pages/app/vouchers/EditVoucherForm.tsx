import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, InputLabel, Select, FormHelperText } from '@mui/material';

type Voucher = {
    description:string;
    vouchertype:number
    voucherno: number
  id: number;
  voucherCode: string;
  amount: number;
  voucherdate: Date | null; // Changed to Date
  // Add other relevant fields here if needed
};

type VoucherProps = {
  vouchers: Voucher[];
};

const schema = yup.object().shape({
    description:yup.string().required(),
    vouchertype:yup.string().required(),
    voucherno:yup.string().required(),
  voucherCode: yup.string().required(),
  amount: yup.number().required(),
  voucherDate: yup.date().required(), // Validation for Date
  // Add other validation rules here if needed
});

const EditVoucherForm = ({ vouchers }: VoucherProps) => {
  // Assuming you are editing the first voucher in the array for demonstration purposes
  const voucher = vouchers[0] || {
    voucherdate: null,
    voucherCode: '',
    amount: 0,
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
        description:voucher.description,
        vouchertype:voucher.vouchertype,
        voucherno : voucher.voucherno,
      voucherCode: voucher.voucherCode,
      amount: voucher.amount,
      voucherDate: voucher.voucherdate ? new Date(voucher.voucherdate) : null, // Convert string to Date
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (formData: any) => {
    console.log(formData);
    toast.success('Form Submitted');
  };
console.log(vouchers,"datav")
  return (
    <Card>
      <CardHeader title="Edit Voucher Form" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Voucher Code */}
            <Grid item xs={12}>
              <Controller
                name="voucherno"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Voucher number"
                    placeholder="Voucher Code"
                    error={Boolean(errors.voucherno)}
                    helperText={errors.voucherno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="vouchertype"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Amount"
                    placeholder="Amount"
                    type="number"
                    error={Boolean(errors.vouchertype)}
                    helperText={errors.vouchertype?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="description"
                
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            {/* Amount */}
            <Grid item xs={12}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Amount"
                    placeholder="Amount"
                    type="number"
                    error={Boolean(errors.amount)}
                    helperText={errors.amount?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Voucher Date */}
            <Grid item xs={12}>
              <Controller
                name="voucherDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Voucher Date"
                    dateFormat="MM/dd/yyyy"
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

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditVoucherForm;
