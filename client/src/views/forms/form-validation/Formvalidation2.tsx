import React, { useEffect } from 'react'
import {
  Card, Grid, Button, CardHeader, CardContent,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

const defaultValues = {
  customerid: '',
  productId: '',
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

  const onSubmit = (data: any) => {
    console.log('Submitted data:', data)
    toast.success('Order Submitted!')
    reset()
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
      <CardHeader title='Create Order' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>

            <Grid item xs={12}>
              <Controller
                name='customerid'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='customer-label'>Customer</InputLabel>
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
                  </FormControl>
                )}
              />
            </Grid>


            <Grid item xs={12}>
              <Controller
                name='productId'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id='product-label'>Product ID</InputLabel>
                    <Select
                      {...field}
                      labelId='product-label'
                      label='Product ID'
                      // value={field.value || ''}
                      value='Bottle'
                      onChange={field.onChange}
                      disabled={true} // Assuming you want to disable this field

                    >
                      <MenuItem selected value='Bottle'>Bottle</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {/* Payment Mode */}
            <Grid item xs={12}>
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

            <Grid item xs={12}>
              <Controller
                name='orderDate'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    type='date'
                    label='Order Date'
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.orderDate)}
                    helperText={errors.orderDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="orderStatus"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="order-status-label">Order Status</InputLabel>
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
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller name='quantity' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Quantity' placeholder='Quantity' />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name='returnedQty' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Returned Quantity' placeholder='Returned Quantity' />
              )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name='unitPrice' 
              control={control} 
              render={({ field }) => (
                <CustomTextField 
                fullWidth 
                {...field} 
                label='Unit Price' 
                placeholder='Unit Price'
                disabled={true}
              />
            )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='totalAmount' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Total Amount' placeholder='Total Amount' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='remarks' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Delivery/Remarks Notes' placeholder='Remarks' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='bottleReturnedDate' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Bottle Returned Date' placeholder='Returned Date' />
              )} />
            </Grid>



            <Grid item xs={12}>
              <Controller name='deliveryDate' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Delivery Date' placeholder='Delivery Date' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='deliveryAddress' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Delivery Address' placeholder='Delivery Address' />
              )} />
            </Grid>


            <Grid item xs={12}>
              <Controller name='invoiceNo' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Invoice No' placeholder='Invoice No' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='invoiceDate' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Invoice Date' placeholder='Invoice Date' />
              )} />
            </Grid>

            <Grid item xs={12}>
              <Controller name='telephone' control={control} render={({ field }) => (
                <CustomTextField fullWidth {...field} label='Telephone' placeholder='Telephone' />
              )} />
            </Grid>
            <Grid item xs={12}>
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
