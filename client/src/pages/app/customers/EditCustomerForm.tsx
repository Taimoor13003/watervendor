import React, { useEffect, useState } from 'react';
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
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { FormValues, CustomerDataFromServer } from './edit';

type EditCustomerFormProps = {
  customerData: CustomerDataFromServer;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: {
    paymentmode: string | number | readonly string[] | undefined; id: number; requirement: string
  }[];
  deliveryPersons: {
    lastname: string; id: number; empid: string; employeecode: string; firstname: string; middlename: string
  }[];
};

const schema = yup.object().shape({
  firstname: yup.string().required(),
  lastname: yup.string().required(),
  datefirstcontacted: yup.string(),
  customertype: yup.string().required(),
  dateofbirth: yup.string(),
  telephoneres: yup.string(),
  telephoneoffice: yup.string(),
  addressres: yup.string(),
  email: yup.string().email('Enter a valid email address').default(''),
  delieverydate: yup.string(),
  deliveryarea: yup.string(),
  paymentmode: yup.string().required(),
  notes: yup.string().transform(value => value === null ? '' : value).default(''),
  addressoffice: yup.string(),
  depositamount: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .default(''),
  requirement: yup.string().required(),
  reqbottles: yup
    .string()
    .required('Bottles per visit is required')
    .matches(/^\d+$/, 'Must be a whole number'),
  tax: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .default(''),
  delivery_person: yup.string(),
  customerid: yup.string(),
  rate_per_bottle: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .default(''),
});

const EditCustomerForm = ({ customerData, customerTypes, pickrequirement, paymentmode, deliveryPersons }: EditCustomerFormProps) => {
  const { delivery_person, ...restOfCustomerData } = customerData;

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      ...restOfCustomerData,
      delivery_person: delivery_person?.empid || '',
    },
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    toast.success('Updating customer data...');

    const { delieverydate, ...restOfData } = data;
    const payload = {
      ...restOfData,
      customerid: data.id,
      deliverydate: delieverydate || null,
    };

    try {
      const response = await fetch('/api/update_customer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Customer updated successfully!');
        router.push('/app/customers');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update customer');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title='Edit Customer Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, (errors)=> console.log(errors, "error"))}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='firstname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='First Name'
                    placeholder='John'
                    error={Boolean(errors.firstname)}
                    helperText={errors.firstname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='lastname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Last Name'
                    placeholder='Doe'
                    error={Boolean(errors.lastname)}
                    helperText={errors.lastname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='customertype'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customertype)}>
                    <InputLabel>Customer Type</InputLabel>
                    <Select {...field} label='Customer Type' fullWidth defaultValue=''>
                      {customerTypes.map((type) => (
                        <MenuItem key={type.id} value={type.customertype}>
                          {type.customertype}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.customertype && <FormHelperText>{errors.customertype.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='tax'
                control={control}
                rules={{
                  required: true,
                  validate: value => {
                    const numValue = parseFloat(value);

                    return !isNaN(numValue) && numValue <= 100 || 'Tax cannot be more than 100';
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Tax'
                    onChange={e => {
                      const inputValue = e.target.value;
                      const numValue = parseFloat(inputValue);
                      if (!isNaN(numValue) && numValue <= 100 || inputValue === '') {
                        onChange(inputValue);
                      }
                    }}
                    placeholder='Enter tax amount'
                    type='number'
                    error={Boolean(errors.tax)}
                    aria-describedby='validation-schema-tax'
                    {...(errors.tax && { helperText: errors.tax.message })}
                    inputProps={{ max: 100 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='requirement'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.requirement)}>
                    <InputLabel>Requirements</InputLabel>
                    <Select {...field} label='Requirements' fullWidth defaultValue=''>
                      {pickrequirement.map((req) => (
                        <MenuItem key={req.id} value={req.requirement}>
                          {req.requirement}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.requirement && <FormHelperText>{errors.requirement.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='paymentmode'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select {...field} label='Payment Mode' fullWidth defaultValue=''>
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
            <Grid item xs={12}>
              <Controller
                name='accountno'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Customer Account#'
                    placeholder='123456'
                    error={Boolean(errors.accountno)}
                    helperText={errors.accountno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='telephoneres'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Delivery Telephone#'
                    placeholder='123456'
                    error={Boolean(errors.telephoneres)}
                    helperText={errors.telephoneres?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='telephoneoffice'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Office Telephone#'
                    placeholder='123456'
                    error={Boolean(errors.telephoneoffice)}
                    helperText={errors.telephoneoffice?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='addressres'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Delivery Address'
                    placeholder='123456'
                    error={Boolean(errors.addressres)}
                    helperText={errors.addressres?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='email'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Email Address'
                    InputLabelProps={{ shrink: true }}
                    placeholder='johndoe@example.com'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='datefirstcontacted'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='date'
                    label='Date First Contacted'
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.datefirstcontacted)}
                    helperText={errors.datefirstcontacted?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='dateofbirth'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='date'
                    label='Date of Birth'
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.dateofbirth)}
                    helperText={errors.dateofbirth?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='delieverydate'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    type='date'
                    label='Delivery Date'
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.delieverydate)}
                    helperText={errors.delieverydate?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='deliveryarea'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Delivery Area'
                    placeholder='Area Name'
                    error={Boolean(errors.deliveryarea)}
                    helperText={errors.deliveryarea?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='addressoffice'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Office Address'
                    placeholder='Office Address'
                    error={Boolean(errors.addressoffice)}
                    helperText={errors.addressoffice?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='depositamount'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Deposit Amount'
                    placeholder='1000'
                    error={Boolean(errors.depositamount)}
                    helperText={errors.depositamount?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='requirement'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.requirement)}>
                    <InputLabel>Requirements</InputLabel>
                    <Select {...field} label='Requirements' fullWidth defaultValue=''>
                      {pickrequirement.map((req) => (
                        <MenuItem key={req.id} value={req.requirement}>
                          {req.requirement}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.requirement && <FormHelperText>{errors.requirement.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
           
            <Grid item xs={12}>
              <Controller
                name='reqbottles'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Required Bottles'
                    placeholder='10'
                    error={Boolean(errors.reqbottles)}
                    helperText={errors.reqbottles?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditCustomerForm;
