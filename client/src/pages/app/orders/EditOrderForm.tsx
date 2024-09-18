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

type Order = {
  orderid: number;
  firstname: string;
  lastname: string;
  orderno: string;
  customerid: number;
  orderdate: Date;
  invoicedate: Date;
  invoicelastprintdate: Date;
  deliverydate: Date;
  bottlereturndatedate: Date;
  paymentmode: string;
  orderstatus: string;
  deliveryaddress: string;
  deliverynotes: string;
  deliveredbyempid: number;
  deliveredbyvehicleregid: string;
  rate_per_bottle: number;
  reqbottles: number;
  employeefirstname: string;
  employeelastname: string;
  orderqty:string;
};

type OrderDetail = {
  productid: number;
  unitprice: number;
  returnqty: number;
  bottlereturndate: Date;
};

type OrderEditFormProps = {
  data: Order;
  paymentmode: { id: number; paymentmode: string }[];
  orderdetails: OrderDetail[];
};

const schema = yup.object().shape({
  orderno: yup.string().required(),
  accountno: yup.string().required(),
  customerid: yup.number().required(),
  paymentmode: yup.string().required(),
  orderdate: yup.date().required(),
  orderstatus: yup.string().required(),
  orderamount: yup.number().required(),
  orderqty: yup.number().required(),
  deliverydate: yup.date(),
  delivery_person: yup.number().required(),
  deliveryaddress: yup.string().required(),
  deliveryarea: yup.string().required(),
  deliverynotes: yup.string(),
  bottlereturndate: yup.date(),
  productid: yup.number().required(),
  returnqty: yup.number().required(),
  unitprice: yup.number().required(),
});

const OrderEditForm = ({ data, paymentmode, orderdetails }: OrderEditFormProps) => {
  const orderDetail = orderdetails[0] || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...data,
      ...orderDetail,
      fullname: `${data.firstname} ${data.lastname}`,
      productid: orderDetail.productid || '',
      unitprice: orderDetail.unitprice || '',
      bottlereturndate: orderDetail.bottlereturndate || '',
      returnqty: orderDetail.returnqty || 0,
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
      <CardHeader title="Edit Order Form" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Account Number */}
            <Grid item xs={12}>
              <Controller
                name="orderno"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Order Number"
                    placeholder="Order Number"
                    error={Boolean(errors.orderno)}
                    helperText={errors.orderno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Customer Name */}
            <Grid item xs={12}>
              <Controller
                name="fullname"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Customer Name"
                    placeholder="Name"
                    error={Boolean(errors.fullname)}
                    helperText={errors.fullname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Product ID */}
            <Grid item xs={12}>
              <Controller
                name="productid"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Product ID"
                    placeholder="Product ID"
                    error={Boolean(errors.productid)}
                    helperText={errors.productid?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Payment Mode */}
            <Grid item xs={12}>
              <Controller
                name="paymentmode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select {...field} label="Payment Mode" fullWidth defaultValue="">
                      {paymentmode.map((mode) => (
                        <MenuItem key={mode.id} value={mode.paymentmode}>
                          {mode.paymentmode}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.paymentmode && <FormHelperText>{errors.paymentmode.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Order Date */}
            <Grid item xs={12}>
              <Controller
                name="orderdate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Order Date"
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Order Date"
                        error={Boolean(errors.orderdate)}
                        helperText={errors.orderdate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Order Status */}
            <Grid item xs={12}>
              <Controller
                name="orderstatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Order Status"
                    error={Boolean(errors.orderstatus)}
                    helperText={errors.orderstatus?.message}
                    {...field}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Canceled">Canceled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Quantity */}
            <Grid item xs={12}>
              <Controller
                name="orderqty"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Quantity"
                    placeholder="Order Quantity"
                    type="number"
                    error={Boolean(errors.orderqty)}
                    helperText={errors.orderqty?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Delivery Notes */}
            <Grid item xs={12}>
              <Controller
                name="deliverynotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery Remarks/Notes"
                    placeholder="Delivery Notes"
                    error={Boolean(errors.deliverynotes)}
                    helperText={errors.deliverynotes?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Unit Price */}
            <Grid item xs={12}>
              <Controller
                name="unitprice"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Unit Price"
                    placeholder="Unit Price"
                    type="number"
                    error={Boolean(errors.unitprice)}
                    helperText={errors.unitprice?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Return Quantity */}
            <Grid item xs={12}>
              <Controller
                name="returnqty"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Return Quantity"
                    placeholder="Return Quantity"
                    type="number"
                    error={Boolean(errors.returnqty)}
                    helperText={errors.returnqty?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Bottles Return Date */}
            <Grid item xs={12}>
              <Controller
                name="bottlereturndate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Bottles Return Date"
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Bottles Return Date"
                        error={Boolean(errors.bottlereturndate)}
                        helperText={errors.bottlereturndate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Delivery Date */}
            <Grid item xs={12}>
              <Controller
                name="deliverydate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Delivery Date"
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Delivery Date"
                        error={Boolean(errors.deliverydate)}
                        helperText={errors.deliverydate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Delivery Address */}
            <Grid item xs={12}>
              <Controller
                name="deliveryaddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery Address"
                    placeholder="Delivery Address"
                    error={Boolean(errors.deliveryaddress)}
                    helperText={errors.deliveryaddress?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderEditForm;
