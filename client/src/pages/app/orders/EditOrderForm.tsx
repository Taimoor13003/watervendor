import React, { useState } from 'react';
import {
  Card,
  Grid,
  Button,
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/router';
import CustomTextField from 'src/@core/components/mui/text-field';

type Order = {
  orderid: number;
  firstname: string;
  lastname: string;
  orderno: string;
  customerid: number;
  orderdate: string | null;
  deliverydate: string | null;
  paymentmode: string;
  orderstatus: string;
  deliveryaddress: string;
  deliverynotes: string;
  invoicedate?: string | null;
  invoiceno?: number | null;
  telephone?: string | null;
  notes?: string | null;
  orderamount?: number | null;
  orderqty: number | string;
};

type OrderDetail = {
  productid: number | null;
  unitprice: number | null;
  returnqty: number | null;
  bottlereturndate: string | null;
};

type OrderEditFormProps = {
  data: Order;
  paymentmode: { id: number; paymentmode: string }[];
  orderdetails: OrderDetail[];
};

const RequiredLabel = ({ label }: { label: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Box component='span' sx={{ color: 'error.main', fontWeight: 700 }}>*</Box>
  </Box>
);

const OrderEditForm = ({ data, paymentmode, orderdetails }: OrderEditFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const orderDetail = orderdetails[0] || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...data,
      ...orderDetail,
      fullname: `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim(),
      productid: orderDetail.productid ?? 1,
      unitprice: orderDetail.unitprice ?? '',
      bottlereturndate: orderDetail.bottlereturndate ?? '',
      returnqty: orderDetail.returnqty ?? '',
      invoicedate: data?.invoicedate ?? '',
      invoiceno: data?.invoiceno ?? '',
      telephone: data?.telephone ?? '',
      deliverynotes: data?.deliverynotes ?? '',
    },
    mode: 'onChange',
  });

  const toNumberOrNull = (value: any) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);
    const payload = {
      orderid: data.orderid,
      paymentmode: formData.paymentmode,
      orderstatus: formData.orderstatus,
      deliveryaddress: formData.deliveryaddress,
      deliverynotes: formData.deliverynotes,
      orderdate: formData.orderdate || null,
      invoiceno: toNumberOrNull(formData.invoiceno),
      invoicedate: formData.invoicedate || null,
      telephone: formData.telephone || '',
      orderqty: toNumberOrNull(formData.orderqty),
      orderamount: toNumberOrNull(formData.orderamount),
      deliverydate: formData.deliverydate || null,
      productid: toNumberOrNull(formData.productid),
      unitprice: toNumberOrNull(formData.unitprice),
      quantity: toNumberOrNull(formData.orderqty),
      returnqty: toNumberOrNull(formData.returnqty),
      bottlereturndate: formData.bottlereturndate || null,
    };

    try {
      const res = await fetch('/api/order-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to update order');
      }

      toast.success('Order updated');
      router.push('/app/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title='Edit Order' subheader='Update order details, delivery, and billing.' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="orderno"
                control={control}
                rules={{ required: 'Order number is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={<RequiredLabel label='Order Number' />}
                    placeholder="Order Number"
                    error={Boolean(errors.orderno)}
                    helperText={(errors.orderno as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="fullname"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Customer Name"
                    placeholder="Name"
                    disabled
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="productid"
                control={control}
                rules={{ required: 'Product is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.productid)}>
                    <InputLabel required id="product-label">Product</InputLabel>
                    <Select
                      {...field}
                      labelId="product-label"
                      label="Product"
                      value={field.value || ''}
                      onChange={field.onChange}
                    >
                      <MenuItem value={1}>Bottle</MenuItem>
                    </Select>
                    <FormHelperText>{(errors.productid as any)?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="paymentmode"
                control={control}
                rules={{ required: 'Payment mode is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel required>Payment Mode</InputLabel>
                    <Select {...field} label="Payment Mode" fullWidth>
                      {paymentmode.map((mode) => (
                        <MenuItem key={mode.id} value={mode.paymentmode}>
                          {mode.paymentmode}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{(errors.paymentmode as any)?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="orderdate"
                control={control}
                rules={{ required: 'Order date is required' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value as any) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Order Date"
                    customInput={
                      <CustomTextField
                        fullWidth
                        label={<RequiredLabel label='Order Date' />}
                        error={Boolean(errors.orderdate)}
                        helperText={(errors.orderdate as any)?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="orderstatus"
                control={control}
                rules={{ required: 'Order status is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.orderstatus)}>
                    <InputLabel required id="order-status-label">Order Status</InputLabel>
                    <Select
                      {...field}
                      labelId="order-status-label"
                      label="Order Status"
                      value={field.value || ''}
                      onChange={field.onChange}
                    >
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Canceled">Canceled</MenuItem>
                    </Select>
                    <FormHelperText>{(errors.orderstatus as any)?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="orderqty"
                control={control}
                rules={{ required: 'Quantity is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={<RequiredLabel label='Quantity' />}
                    placeholder="Order Quantity"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.orderqty)}
                    helperText={(errors.orderqty as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="orderamount"
                control={control}
                rules={{ required: 'Total amount is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={<RequiredLabel label='Total Amount' />}
                    placeholder="Total Amount"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.orderamount)}
                    helperText={(errors.orderamount as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="unitprice"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Unit Price"
                    placeholder="Unit Price"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    disabled
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="returnqty"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Return Quantity"
                    placeholder="Return Quantity"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.returnqty)}
                    helperText={(errors.returnqty as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="bottlereturndate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value as any) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Bottles Return Date"
                    customInput={
                      <CustomTextField
                        fullWidth
                        label="Bottles Return Date"
                        error={Boolean(errors.bottlereturndate)}
                        helperText={(errors.bottlereturndate as any)?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="deliverydate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value as any) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Delivery Date"
                    customInput={
                      <CustomTextField
                        fullWidth
                        label="Delivery Date"
                        error={Boolean(errors.deliverydate)}
                        helperText={(errors.deliverydate as any)?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="deliveryaddress"
                control={control}
                rules={{ required: 'Delivery address is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={<RequiredLabel label='Delivery Address' />}
                    placeholder="Delivery Address"
                    error={Boolean(errors.deliveryaddress)}
                    helperText={(errors.deliveryaddress as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="deliverynotes"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Delivery Remarks/Notes"
                    placeholder="Delivery Notes"
                    error={Boolean(errors.deliverynotes)}
                    helperText={(errors.deliverynotes as any)?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="invoiceno"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Invoice No"
                    placeholder="Invoice No"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="invoicedate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value as any) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Invoice Date"
                    customInput={
                      <CustomTextField
                        fullWidth
                        label="Invoice Date"
                        error={Boolean(errors.invoicedate)}
                        helperText={(errors.invoicedate as any)?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="telephone"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Telephone"
                    placeholder="Telephone"
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained">
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
