import React, { ReactNode, useEffect } from 'react';
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
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

type FormValues = {
  firstname: string;
  lastname: string;
  datefirstcontacted: string; // Date as string
  customertype: string;
  dateofbirth: string;
  accountno: string;
  telephoneres: string;
  telephoneoffice: string;
  addressres: string;
  email: string;
  delieverydate: string;
  deliveryarea: string;
  paymentmode: string;
  notes: string;
  addressoffice: string;
  depositamount: string;
  requirement: string;
  delivery_person: { empid: string, firstname: string, lastname: string };
  reqbottles: string;
};

type EditCustomerFormProps = {
  customerData: FormValues;
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
  datefirstcontacted: yup.string().required(), // Validation for date
  customertype: yup.string().required(),
  dateofbirth: yup.string().required(),
  accountno: yup.string().required(),
  telephoneres: yup.string().required(),
  telephoneoffice: yup.string().required(),
  addressres: yup.string().required(),
  email: yup.string().required(),
  delieverydate: yup.string().required(),
  deliveryarea: yup.string().required(),
  paymentmode: yup.string().required(),
  notes: yup.string().required(),
  addressoffice: yup.string().required(),
  depositamount: yup.string().required(),
  requirement: yup.string().required(),
  delivery_person: yup.string().required(),
  reqbottles: yup.string().required()
});

const EditCustomerForm = ({ customerData, customerTypes, pickrequirement, paymentmode, deliveryPersons }: EditCustomerFormProps) => {
  // @ts-ignore
  customerData = JSON.parse(customerData)[0]

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: customerData,
    mode: 'onChange',
    resolver: yupResolver(schema)
  });
  console.log(customerData, "alldata");
  console.log(customerTypes, "customerTypes");
  console.log(pickrequirement, "pickrequirement");
  console.log(paymentmode, "paymentmode");
  console.log(deliveryPersons, "deliveryPersons");

  const onSubmit = (data: FormValues) => {
    toast.success('Form Submitted');
    console.log(data);
    // Handle form submission logic here
  };


  useEffect(() => {
    setValue("delivery_person", customerData.delivery_person)
  }, [])

  return (
    <Card>
      <CardHeader title=' Edit Customer Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                  validate: value => value <= 100 || 'Tax cannot be more than 100',
                }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Tax'
                    onChange={e => {
                      const inputValue = parseFloat(e.target.value);
                      if (inputValue <= 100 || e.target.value === '') {
                        onChange(e);
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
                    label='Date First Contacted'
                    type='date'
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
                    placeholder='Amount'
                    error={Boolean(errors.depositamount)}
                    helperText={errors.depositamount?.message}
                    {...field}
                  />
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
                    placeholder='Number of Bottles'
                    error={Boolean(errors.reqbottles)}
                    helperText={errors.reqbottles?.message}
                    {...field}
                  />
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
              <Button type='submit' variant='contained'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditCustomerForm;