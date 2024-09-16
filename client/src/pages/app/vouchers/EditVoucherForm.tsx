import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type Voucher = {
  voucheramount: any;
  description: string;
  vouchertype: number;
  voucherno: number;
  id: number;
  voucherCode: string;
  amount: number;
  voucherdate: Date | null; // Changed to Date
  // Add other relevant fields here if needed
};

type VoucherTrans = {
  id: number;
  voucherId: number;
  accountcode: string;
  chqno: string;
  debitamount: number;
  creditamount: number;
  // Add other relevant fields here if needed
};

type VoucherProps = {
  vouchers: Voucher[];
  vouchertrans: VoucherTrans[]; // Include the vouchertrans prop
};

const schema = yup.object().shape({
  description: yup.string().required(),
  vouchertype: yup.string().required(),
  voucherno: yup.string().required(),
  voucherCode: yup.string().required(),
  amount: yup.number().required(),
  voucherDate: yup.date().required(), // Validation for Date
  accountcode: yup.string().required(),
  chqno: yup.string().required(),
  debitamount: yup.number().required(),
  creditamount: yup.number().required(),
  // Add other validation rules here if needed
});

const EditVoucherForm = ({ vouchers, vouchertrans }: VoucherProps) => {
  console.log(vouchertrans, "vouchertrans");
console.log(vouchers,"vouchersssssssss")
  // Assuming you are editing the first voucher and first transaction for demonstration purposes
  const voucher = vouchers[0] || {
    voucherdate: null,
    voucherCode: '',
    voucheramount: 0,
    description: '',
    vouchertype: 0,
    voucherno: 0,
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
  } = useForm({
    defaultValues: {
      description: voucher.description,
      vouchertype: voucher.vouchertype,
      voucherno: voucher.voucherno,
      voucherCode: voucher.voucherCode,
      voucheramount: voucher.voucheramount,
      voucherDate: voucher.voucherdate ? new Date(voucher.voucherdate) : null,
      accountcode: voucherTransaction.accountcode,
      chqno: voucherTransaction.chqno,
      debitamount: voucherTransaction.debitamount,
      creditamount: voucherTransaction.creditamount,
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (formData: any) => {
    console.log(formData);
    toast.success('Form Submitted');
  };

  return (
    <Card>
      <CardHeader title="Edit Voucher Form" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Voucher Number */}
            <Grid item xs={12}>
              <Controller
                name="voucherno"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Voucher number"
                    placeholder="Voucher Number"
                    error={Boolean(errors.voucherno)}
                    helperText={errors.voucherno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Voucher Type */}
            <Grid item xs={12}>
              <Controller
                name="vouchertype"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Voucher Type"
                    placeholder="Voucher Type"
                    type="number"
                    error={Boolean(errors.vouchertype)}
                    helperText={errors.vouchertype?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Description"
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
                name="voucheramount"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Amount"
                    placeholder="Amount"
                    type="number"
                    error={Boolean(errors.voucheramount)}
                    helperText={errors.voucheramount?.message}
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

            <h1>Voucher Transaction</h1>

            {/* Account Code */}
            <Grid item xs={12}>
              <Controller
                name="accountcode"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Account Code"
                    placeholder="Account Code"
                    error={Boolean(errors.accountcode)}
                    helperText={errors.accountcode?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Cheque / Inv # */}
            <Grid item xs={12}>
              <Controller
                name="chqno"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Cheque / Inv #"
                    placeholder="Cheque / Inv #"
                    error={Boolean(errors.chqno)}
                    helperText={errors.chqno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Debit Amount */}
            <Grid item xs={12}>
              <Controller
                name="debitamount"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Debit Amount"
                    placeholder="Debit Amount"
                    type="number"
                    error={Boolean(errors.debitamount)}
                    helperText={errors.debitamount?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Credit Amount */}
            <Grid item xs={12}>
              <Controller
                name="creditamount"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Credit Amount"
                    placeholder="Credit Amount"
                    type="number"
                    error={Boolean(errors.creditamount)}
                    helperText={errors.creditamount?.message}
                    {...field}
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
