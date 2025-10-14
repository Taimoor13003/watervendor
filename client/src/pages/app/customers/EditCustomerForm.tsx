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
  deliverydate: yup.string(),
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

    const { deliverydate, ...restOfData } = data;
    const payload = {
      ...restOfData,
      customerid: data.id,
      deliverydate: deliverydate || null,
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
            {[
              { name: 'firstname', label: 'First Name', placeholder: 'John', sm: 6 },
              { name: 'lastname', label: 'Last Name', placeholder: 'Doe', sm: 6 },
              { name: 'accountno', label: 'Customer Account#', placeholder: '123456', sm: 6 },
              { name: 'telephoneres', label: 'Delivery Telephone#', placeholder: '123456', sm: 6 },
              { name: 'telephoneoffice', label: 'Office Telephone#', placeholder: '123456', sm: 6 },
              { name: 'email', label: 'Email Address', placeholder: 'johndoe@example.com', sm: 6 },
              { name: 'datefirstcontacted', label: 'Date First Contacted', type: 'date', sm: 6 },
              { name: 'dateofbirth', label: 'Date of Birth', type: 'date', sm: 6 },
              { name: 'deliverydate', label: 'Delivery Date', type: 'date', sm: 6 },
              { name: 'deliveryarea', label: 'Delivery Area', placeholder: 'Area Name', sm: 6 },
              { name: 'depositamount', label: 'Deposit Amount', placeholder: '1000', sm: 6 },
              { name: 'reqbottles', label: 'Required Bottles', placeholder: '10', sm: 6 },
              { name: 'addressres', label: 'Delivery Address', placeholder: '123456', sm: 6, multiline: true, rows: 2 },
              { name: 'addressoffice', label: 'Office Address', placeholder: 'Office Address', sm: 6, multiline: true, rows: 2 },
            ].map((fieldInfo) => (
              <Grid item xs={12} sm={fieldInfo.sm} key={fieldInfo.name}>
                <Controller
                  name={fieldInfo.name as keyof FormValues}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label={fieldInfo.label}
                      placeholder={fieldInfo.placeholder}
                      type={fieldInfo.type || 'text'}
                      multiline={fieldInfo.multiline || false}
                      rows={fieldInfo.rows || 1}
                      error={Boolean(errors[fieldInfo.name as keyof FormValues])}
                      helperText={errors[fieldInfo.name as keyof FormValues]?.message}
                      InputLabelProps={fieldInfo.type === 'date' ? { shrink: true } : {}}
                      {...field}
                    />
                  )}
                />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <Controller
                name='customertype'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customertype)}>
                    <InputLabel>Customer Type</InputLabel>
                    <Select {...field} label='Customer Type' fullWidth>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='tax'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Tax'
                    placeholder='Enter tax amount'
                    type='number'
                    error={Boolean(errors.tax)}
                    helperText={errors.tax?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='requirement'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.requirement)}>
                    <InputLabel>Requirements</InputLabel>
                    <Select {...field} label='Requirements' fullWidth>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name='paymentmode'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select {...field} label='Payment Mode' fullWidth>
                      {paymentmode.map((mode) => (
                        <MenuItem key={mode.id} value={mode.paymentmode as string}>
                          {mode.paymentmode as string}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.paymentmode && <FormHelperText>{errors.paymentmode.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='delivery_person'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.delivery_person)}>
                    <InputLabel>Delivery Person</InputLabel>
                    <Select {...field} label='Delivery Person' fullWidth>
                      {deliveryPersons.map((person) => (
                        <MenuItem key={person.id} value={person.empid}>
                          {person.firstname} {person.lastname}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.delivery_person && <FormHelperText>{errors.delivery_person.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Notes'
                    placeholder='Any specific information'
                    multiline
                    rows={4}
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
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
