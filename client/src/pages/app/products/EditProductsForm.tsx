import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CustomTextField from 'src/@core/components/mui/text-field'; // Ensure this path is correct
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type FormValues = {
  productcode: string;
  productname: string;
  unitsinstock: number;
  totalunits: number;
  rateperunitcash: number;
  rateperunitcoupon: number;
  remarks: string;
};

type EditProductFormProps = {
  productData: FormValues;
};

const schema = yup.object().shape({
  productcode: yup.string().required('Product code is required'),
  productname: yup.string().required('Product name is required'),
  unitsinstock: yup.number().required('Units in stock is required').min(0, 'Units in stock cannot be negative'),
  totalunits: yup.number().required('Total units is required').min(0, 'Total units cannot be negative'),
  rateperunitcash: yup.number().required('Rate per unit (Cash) is required').min(0, 'Rate cannot be negative'),
  rateperunitcoupon: yup.number().required('Rate per unit (Coupon) is required').min(0, 'Rate cannot be negative'),
  remarks: yup.string().optional(),
});

const EditProductsForm = ({ productData }: EditProductFormProps) => {
  const { control, handleSubmit, formState: { errors }} = useForm<FormValues>({
    defaultValues: productData,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    toast.success('Form Submitted');
    console.log(data);
    // Handle form submission logic here
  };

  return (
    <Card>
      <CardHeader title='Edit Product Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='productcode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Product Code'
                    placeholder='Enter product code'
                    error={Boolean(errors.productcode)}
                    helperText={errors.productcode?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='productname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Product Name'
                    placeholder='Enter product name'
                    error={Boolean(errors.productname)}
                    helperText={errors.productname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='unitsinstock'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Units in Stock'
                    type='number'
                    placeholder='Enter units in stock'
                    error={Boolean(errors.unitsinstock)}
                    helperText={errors.unitsinstock?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
  <Controller
    name='totalunits'
    control={control}
    rules={{
      required: true,
      validate: value => value <= 99999 || 'Total units cannot be more than 99999',
    }}
    render={({ field: { value, onChange } }) => (
      <CustomTextField
        fullWidth
        label='Total Units'
        type='number'
        placeholder='Enter total units'
        error={Boolean(errors.totalunits)}
        helperText={errors.totalunits?.message}
        onChange={e => {
          const inputValue = e.target.value;

          // Allow only up to 5 digits
          if (inputValue.length <= 5 && (!isNaN(parseInt(inputValue)) || inputValue === '')) {
            onChange(e);
          }
        }}
        value={value}
        inputProps={{ max: 99999, maxLength: 5 }}
      />
    )}
  />
</Grid>



            <Grid item xs={12}>
              <Controller
                name='rateperunitcash'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Rate Per Unit'
                    type='number'
                    placeholder='Enter rate per unit (cash)'
                    error={Boolean(errors.rateperunitcash)}
                    helperText={errors.rateperunitcash?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

           

            <Grid item xs={12}>
              <Controller
                name='remarks'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Remarks / Note'
                    placeholder='Enter remarks or notes'
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks?.message}
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

export default EditProductsForm;
