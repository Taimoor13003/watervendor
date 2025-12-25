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
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress, Box, Divider, Typography, FormControlLabel, Switch, RadioGroup, Radio } from '@mui/material';
import { useRouter } from 'next/router';
import { FormValues, CustomerDataFromServer } from './edit';

const RequiredLabel = ({ label }: { label: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Box component='span' sx={{ color: 'error.main', fontWeight: 700 }}>*</Box>
  </Box>
)

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
  deliveryAreas: { id: number; deliveryarea: string }[];
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
  email: yup.string().email('Enter a valid email address').nullable().transform(v => (v === '' ? null : v)),
  deliverydate: yup.string(),
  deliveryarea: yup.string(),
  paymentmode: yup.string().required(),
  notes: yup.string(),
  addressoffice: yup.string(),
  depositamount: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .nullable()
    .transform(v => (v === '' ? null : v)),
  requirement: yup.string().required(),
  reqbottles: yup
    .string()
    .required('Bottles per visit is required')
    .matches(/^\d+$/, 'Must be a whole number'),
  tax: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .nullable()
    .transform(v => (v === '' ? null : v)),
  delivery_person: yup.string(),
  customerid: yup.string(),
  rate_per_bottle: yup
    .string()
    .matches(/^\d*(\.\d+)?$/, 'Must be a valid number')
    .nullable()
    .transform(v => (v === '' ? null : v)),
});

const EditCustomerForm = ({
  customerData,
  customerTypes,
  pickrequirement,
  paymentmode,
  deliveryPersons,
  deliveryAreas = []
}: EditCustomerFormProps) => {
  const { delivery_person, ...restOfCustomerData } = customerData;

  const coerce = (val: any) => (val === null || val === undefined ? '' : String(val));

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      ...restOfCustomerData,
      firstname: coerce(restOfCustomerData.firstname),
      lastname: coerce(restOfCustomerData.lastname),
      datefirstcontacted: coerce(restOfCustomerData.datefirstcontacted),
      customertype: coerce(restOfCustomerData.customertype),
      dateofbirth: coerce(restOfCustomerData.dateofbirth),
      accountno: coerce(restOfCustomerData.accountno),
      telephoneres: coerce(restOfCustomerData.telephoneres),
      telephoneoffice: coerce(restOfCustomerData.telephoneoffice),
      addressres: coerce(restOfCustomerData.addressres),
      email: coerce(restOfCustomerData.email),
      deliverydate: coerce(restOfCustomerData.deliverydate),
      deliveryarea: coerce(restOfCustomerData.deliveryarea),
      paymentmode: coerce(restOfCustomerData.paymentmode),
      notes: coerce(restOfCustomerData.notes),
      addressoffice: coerce(restOfCustomerData.addressoffice),
      depositamount: coerce(restOfCustomerData.depositamount),
      requirement: coerce(restOfCustomerData.requirement),
      reqbottles: coerce(restOfCustomerData.reqbottles),
      tax: coerce(restOfCustomerData.tax),
      customerid: coerce(restOfCustomerData.customerid),
      rate_per_bottle: coerce(restOfCustomerData.rate_per_bottle),
      istaxable: restOfCustomerData.istaxable ?? false,
      isdepositvoucherdone: restOfCustomerData.isdepositvoucherdone ?? false,
      gender: restOfCustomerData.gender ?? 'Mr',
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
            <Grid item xs={12}>
              <Typography variant='h6'>Basic Information</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            {[
              { name: 'firstname', label: <RequiredLabel label='First Name' />, placeholder: 'John', sm: 6 },
              { name: 'lastname', label: <RequiredLabel label='Last Name' />, placeholder: 'Doe', sm: 6 },
              { name: 'rate_per_bottle', label: 'Rate/Bottle', placeholder: '123456', type: 'number', sm: 6 },
              { name: 'telephoneres', label: 'Delivery Telephone#', placeholder: '123456', type: 'number', sm: 6 },
              { name: 'telephoneoffice', label: 'WhatsAPP Number#', placeholder: '123456', type: 'number', sm: 6 },
              { name: 'datefirstcontacted', label: 'Date First Contacted', type: 'date', sm: 6 },
              { name: 'dateofbirth', label: 'Date Of Birth', type: 'date', sm: 6 },
              { name: 'deliverydate', label: 'Delivery Date', type: 'date', sm: 6 },
              { name: 'depositamount', label: 'Deposit Amount', placeholder: '123456', sm: 6, type: 'number' },
              { name: 'email', label: 'Email Address', sm: 6 },
              { name: 'addressres', label: 'Delivery Address', placeholder: '123456', sm: 6, multiline: true, rows: 2 },
              { name: 'addressoffice', label: 'Office Address', placeholder: '123456', sm: 6, multiline: true, rows: 2 },
              { name: 'notes', label: 'Notes', placeholder: 'Any specific information', sm: 12, multiline: true, rows: 4 },
            ].map((fieldInfo) => (
              <Grid item xs={12} sm={fieldInfo.sm || 12} key={fieldInfo.name}>
                <Controller
                  name={fieldInfo.name as keyof FormValues}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      fullWidth
                      label={fieldInfo.label as any}
                      placeholder={fieldInfo.placeholder}
                      type={fieldInfo.type || 'text'}
                      multiline={fieldInfo.multiline || false}
                      rows={fieldInfo.rows || 1}
                      error={Boolean(errors[fieldInfo.name as keyof FormValues])}
                      helperText={errors[fieldInfo.name as keyof FormValues]?.message}
                      InputLabelProps={fieldInfo.type === 'date' ? { shrink: true } : {}}
                      inputProps={fieldInfo.type === 'number' ? { min: 0 } : undefined}
                      {...field}
                    />
                  )}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant='h6'>Customer Preferences</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='customertype'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customertype)}>
                    <InputLabel required>Customer Type</InputLabel>
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
                    label='Tax (Percentage)'
                    placeholder='Enter tax amount'
                    type='number'
                    inputProps={{ max: 100, min: 0 }}
                    onChange={(e) => {
                      const inputValue = parseFloat(e.target.value);
                      if (inputValue <= 100 || e.target.value === '') {
                        field.onChange(e);
                      }
                    }}
                    error={Boolean(errors.tax)}
                    helperText={errors.tax?.message}
                    value={field.value}
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
                    <InputLabel required>Requirements</InputLabel>
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
                    <InputLabel required>Payment Mode</InputLabel>
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
                name='deliveryarea'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.deliveryarea)}>
                    <InputLabel>Delivery Area</InputLabel>
                    <Select {...field} label='Delivery Area' fullWidth value={field.value || ''}>
                      {deliveryAreas.map(area => (
                        <MenuItem key={area.id} value={area.deliveryarea}>
                          {area.deliveryarea}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.deliveryarea && <FormHelperText>{errors.deliveryarea.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='reqbottles'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={<RequiredLabel label='Bottles Per Visit' />}
                    placeholder='123456'
                    type='number'
                    inputProps={{ min: 0 }}
                    error={Boolean(errors.reqbottles)}
                    helperText={errors.reqbottles?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='istaxable'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />} label='Taxable' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='isdepositvoucherdone'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />} label='Deposit Voucher Done' />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller
                    name='gender'
                    control={control}
                    render={({ field }) => (
                      <FormControl component='fieldset'>
                        <Typography variant='body2' sx={{ mb: 1 }}>Gender</Typography>
                        <RadioGroup row {...field}>
                          <FormControlLabel value='Mr' control={<Radio />} label='Mr' />
                          <FormControlLabel value='Ms' control={<Radio />} label='Ms' />
                          <FormControlLabel value='Mrs' control={<Radio />} label='Mrs' />
                        </RadioGroup>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
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
