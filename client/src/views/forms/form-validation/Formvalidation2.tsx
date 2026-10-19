import React, { useEffect, useState } from 'react'
import {
  Card, Grid, Button, CardHeader, CardContent,
  CircularProgress, Box, Autocomplete, TextField
} from '@mui/material'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomTextField from 'src/@core/components/mui/text-field'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios';
import { authFetch } from 'src/lib/api-client'
import { toCalendarDateString } from 'src/lib/calendar-date'
import { useSubmitOnce } from 'src/hooks/useSubmitOnce'
import { DISPLAY_DATE_FORMAT } from 'src/lib/display-date'

const RequiredLabel = ({ label }: { label: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Box component='span' sx={{ color: 'error.main', fontWeight: 700 }}>*</Box>
  </Box>
)

// Bottle is the only product sold, so the order form does not ask for it.
const BOTTLE_PRODUCT_ID = 1

const defaultValues = {
  customerid: '',
  productId: BOTTLE_PRODUCT_ID,
  paymentMode: '',
  orderDate: '' as Date | '',
  orderStatus: 'New',
  quantity: '',
  remarks: '',
  unitPrice: '',
  totalAmount: '',
  bottleReturnedDate: '',
  returnedQty: '',
  deliveryAddress: '',
  deliveryNotes: '',
  telephone: ''
}

// Like the desktop RMS "Create New Order": the order date starts at today, the
// status is always "New", and there is no separate delivery date (it is the
// order date). Invoice number and date are set later from the order itself.
const freshValues = () => ({ ...defaultValues, orderDate: new Date() as Date | '' })
// @ts-ignore
const FormValidationSchema = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: freshValues(),
    mode: 'onChange'
  })
  const { once: submitOnce, submitting } = useSubmitOnce();

  const quantity = watch('quantity')
  const unitPrice = watch('unitPrice')

  useEffect(() => {
    const parsedQuantity = Number(quantity)
    const parsedUnitPrice = Number(unitPrice)

    if (!Number.isNaN(parsedQuantity) && !Number.isNaN(parsedUnitPrice) && quantity !== '' && unitPrice !== '') {
      const total = parsedQuantity * parsedUnitPrice
      setValue('totalAmount', total.toFixed(2))

      return
    }

    setValue('totalAmount', '')
  }, [quantity, unitPrice, setValue])

  const onSubmit = async (data: any) => {
    try {
      // Dates go as the picked calendar day so the time zone cannot move them
      // into the previous day (and month).
      const response = await axios.post('/api/create_order', {
        ...data,
        orderStatus: 'New',
        orderDate: toCalendarDateString(data.orderDate),
        deliveryDate: toCalendarDateString(data.orderDate),
        bottleReturnedDate: toCalendarDateString(data.bottleReturnedDate),
        productId: BOTTLE_PRODUCT_ID
      });
      if (response.status === 201) {
        toast.success('Order created successfully!');
        reset(freshValues());
        setSelectedCustomer(null);
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order.');
    }
  }

  const handleCustomerChange = async (customer: any) => {
    if (!customer) {
      setSelectedCustomer(null)
      setValue('customerid', '')
      setValue('paymentMode', '')
      setValue('deliveryAddress', '')
      setValue('unitPrice', '')
      setValue('totalAmount', '')
      setValue('telephone', '')
      return
    }

    setSelectedCustomer(customer)
    setValue('customerid', customer.customerid)

    try {
      const res = await authFetch(`/api/customer-info?id=${customer.customerid}`)
      const data = await res.json()
      setValue('paymentMode', data.paymentmode || '')
      setValue('deliveryAddress', data.addressres || '')
      setValue('unitPrice', data.rate_per_bottle || '')
      setValue('telephone', data.telephoneres || '')
    } catch (error) {
      console.error('Failed to fetch customer details:', error)
    }
  };


  return (
    <Card>
      <CardHeader title='Create Order' subheader='Capture order details and delivery info.' />
      <CardContent>
        <form onSubmit={submitOnce(handleSubmit(onSubmit))}>
          <Grid container spacing={5}>

            <Grid item xs={12} sm={6}>
              <Controller
                name='customerid'
                control={control}
                rules={{ required: 'Customer is required' }}
                render={({ field }) => (
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option: any) => 
                      option ? `${option.firstname ?? ''} ${option.lastname ?? ''}`.trim() : ''
                    }
                    value={selectedCustomer}
                    onChange={(event, newValue) => {
                      handleCustomerChange(newValue)
                    }}
                    filterOptions={(options, { inputValue }) => {
                      const searchTerm = inputValue.toLowerCase()
                      return options.filter((option: any) => {
                        const fullName = `${option.firstname ?? ''} ${option.lastname ?? ''}`.toLowerCase()
                        return fullName.includes(searchTerm)
                      })
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={<RequiredLabel label='Customer' />}
                        placeholder='Type to search customer...'
                        error={Boolean(errors.customerid)}
                        helperText={errors.customerid?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>


            {/* Payment mode is taken from the customer record and saved with the
                order behind the scenes; the client does not want it on this form. */}

            <Grid item xs={12} sm={6}>
              <Controller
                name='orderDate'
                control={control}
                rules={{ required: 'Order date is required' }}
                render={({ field }) => (
                  <DatePicker
                    dateFormat={DISPLAY_DATE_FORMAT}
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText='Select Order Date'
                    customInput={<CustomTextField fullWidth label='Order Date' error={Boolean(errors.orderDate)} helperText={errors.orderDate?.message} />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Order Status' value='New' disabled />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='quantity'
                control={control}
                rules={{
                  required: 'Quantity is required',
                  validate: value => (Number.isInteger(Number(value)) && Number(value) > 0) || 'Quantity must be a whole number of bottles'
                }}
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
              <Controller
                name='returnedQty'
                control={control}
                rules={{
                  validate: value =>
                    value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0) || 'Returned quantity must be a whole number of bottles'
                }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    {...field}
                    label='Returned Quantity'
                    placeholder='Returned Quantity'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.returnedQty)}
                    helperText={errors.returnedQty?.message}
                  />
                )}
              />
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
                    disabled={true}
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
                    dateFormat={DISPLAY_DATE_FORMAT}
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
              <Button type='submit' variant='contained' disabled={submitting}>Submit</Button>
            </Grid>


          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
