import React, { useEffect } from 'react'
import {
  Card, Grid, Button, CardHeader, CardContent,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Box, FormHelperText
} from '@mui/material'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios';

const RequiredLabel = ({ label }: { label: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Box component='span' sx={{ color: 'error.main', fontWeight: 700 }}>*</Box>
  </Box>
)

const defaultValues = {
  customerid: '',
  productId: 1, // Set default value here
  paymentMode: '',
  orderDate: '',
  orderStatus: '',
  quantity: '',
  remarks: '',
  unitPrice: '',
  totalAmount: '',
  bottleReturnedDate: '',
  returnedQty: '',
  deliveryDate: '',
  deliveryAddress: '',
  deliveryNotes: '',
  invoiceNo: '',
  invoiceDate: '',
  telephone: ''
}
// @ts-ignore
const FormValidationSchema = ({ customers }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues,
    mode: 'onChange'
  })

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('/api/create_order', data);
      if (response.status === 201) {
        toast.success('Order created successfully!');
        reset(); // Reset form fields
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order.');
    }
  }

  const handleCustomerChange = async (customerid: number) => {
    try {
      const res = await fetch(`/api/customer-info?id=${customerid}`); // <-- changed to query param
      const data = await res.json();
      setValue('paymentMode', data.paymentmode || '');
      setValue('deliveryAddress', data.addressres || '');
      setValue('unitPrice', data.rate_per_bottle || '');
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    }
  };


  return (
    <Card>
      <CardHeader title='Create Order' subheader='Capture order details, delivery, and invoice info.' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, (errors)=> console.log(errors, "error"))}>
          <Grid container spacing={5}>

            <Grid item xs={12} sm={6}>
              <Controller
                name='customerid'
                control={control}
                rules={{ required: 'Customer is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customerid)}>
                    <InputLabel required id='customer-label'>Customer</InputLabel>
                    <Select
                      {...field}
                      labelId='customer-label'
                      label='Customer'
                      value={field.value || ''}
                      onChange={e => {
                        field.onChange(e)                     // update form state
                        // @ts-ignore
                        handleCustomerChange(e.target.value) // call your fetch function
                      }}
                    >

                      {customers.map((cust: { customerid: readonly string[] | React.Key | null | undefined; firstname: any; lastname: any }) => (
                        // @ts-ignore
                        <MenuItem key={cust.customerid} value={cust.customerid}>
                          {`${cust.firstname ?? ''} ${cust.lastname ?? ''}`}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.customerid?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
              <Controller
                name='productId'
                control={control}
                rules={{ required: 'Product is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.productId)}>
                    <InputLabel required id='product-label'>Product</InputLabel>
                    <Select
                      {...field}
                      labelId='product-label'
                      label='Product'
                      value={field.value || ''}
                      onChange={field.onChange}
                      readOnly={true}
                      renderValue={(value) => (value ? 'Bottle' : '')}
                    >
                      <MenuItem selected value={1}>Bottle</MenuItem>
                    </Select>
                    <FormHelperText>{errors.productId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            {/* Payment Mode */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='paymentMode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    label='Payment Mode'
                    placeholder='Payment Mode'
                    disabled={true}
                  />
                )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='orderDate'
                control={control}
                rules={{ required: 'Order date is required' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText='Select Order Date'
                    customInput={<CustomTextField fullWidth label='Order Date' error={Boolean(errors.orderDate)} helperText={errors.orderDate?.message} />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="orderStatus"
                control={control}
                rules={{ required: 'Order status is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.orderStatus)}>
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
                      <MenuItem value="Cancel">Cancel</MenuItem>
                    </Select>
                    <FormHelperText>{errors.orderStatus?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='quantity'
                control={control}
                rules={{ required: 'Quantity is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    label={<RequiredLabel label='Quantity' />}
                    placeholder='Quantity'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.quantity)}
                    helperText={errors.quantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='returnedQty' control={control} render={({ field }) => (
                <CustomTextField
                  fullWidth
                  {...field}
                  label='Returned Quantity'
                  placeholder='Returned Quantity'
                  type='number'
                  inputProps={{ min: 0, step: 1 }}
                />
              )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='unitPrice' 
              control={control} 
              render={({ field }) => (
                <CustomTextField 
                fullWidth 
                {...field} 
                label='Unit Price' 
                placeholder='Unit Price'
                type='number'
                inputProps={{ min: 0, step: '0.01' }}
                disabled={true}
              />
            )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='totalAmount'
                control={control}
                rules={{ required: 'Total amount is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    label={<RequiredLabel label='Total Amount' />}
                    placeholder='Total Amount'
                    type='number'
                    inputProps={{ min: 0, step: '0.01' }}
                    error={Boolean(errors.totalAmount)}
                    helperText={errors.totalAmount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller name='remarks' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Delivery/Remarks Notes' placeholder='Remarks' />
              )} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='bottleReturnedDate'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText='Select Bottle Returned Date'
                    customInput={<CustomTextField fullWidth label='Bottle Returned Date' />}
                  />
                )}
              />
            </Grid>



            <Grid item xs={12} sm={6}>
              <Controller
                name='deliveryDate'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText='Select Delivery Date'
                    customInput={<CustomTextField fullWidth label='Delivery Date' />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='deliveryAddress'
                control={control}
                rules={{ required: 'Delivery address is required' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    label={<RequiredLabel label='Delivery Address' />}
                    placeholder='Delivery Address'
                    error={Boolean(errors.deliveryAddress)}
                    helperText={errors.deliveryAddress?.message}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
              <Controller
                name='invoiceNo'
                control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth {...field} label='Invoice No' placeholder='Invoice No' type='number' inputProps={{ min: 0, step: 1 }} />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='invoiceDate'
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText='Select Invoice Date'
                    customInput={<CustomTextField fullWidth label='Invoice Date' />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='telephone'
                control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth {...field} label='Telephone' placeholder='Telephone' />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name='deliveryNotes' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Delivery Remarks/Notes' placeholder='Delivery Notes' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained'>Submit</Button>
            </Grid>


          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
