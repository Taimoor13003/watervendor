import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Icon from 'src/@core/components/icon';
import CustomTextField from 'src/@core/components/mui/text-field';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { authFetch } from 'src/lib/api-client'
import { useSubmitOnce } from 'src/hooks/useSubmitOnce'

type FormValues = {
  productcode: string;
  productname: string;
  unitsinstock: number | string;
  totalunits: number | string;
  rateperunitcash: number | string;
  remarks: string;
  isactive: boolean;
};

const schema = yup.object({
  productcode: yup.string().required('Product code is required'),
  productname: yup.string().required('Product name is required'),
  unitsinstock: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .nullable()
    .transform((value, original) => (original === '' || original === null ? null : value)),
  totalunits: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .nullable()
    .transform((value, original) => (original === '' || original === null ? null : value)),
  rateperunitcash: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .transform((value, original) => (original === '' || original === null ? undefined : value))
    .required('Cash rate is required'),
  remarks: yup.string().max(500, 'Max 500 characters'),
  isactive: yup.boolean(),
});

export type ProductRecord = {
  id: number;
  productcode: string | null;
  productname: string | null;
  unitsinstock: number | null;
  totalunits: number | null;
  rateperunitcash: number | null;
  remarks: string | null;
  isactive?: boolean | null;
};

// Adds a product, or edits one when `product` is given.
const ProductsForm = ({ product }: { product?: ProductRecord }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(product);
  // Opened from Inventory in Hand: Save and Cancel go back there.
  const backTo = router.query.from === 'productreport' ? '/app/productreport' : '/app/products';
  const asField = (value: number | null | undefined) => (value === null || value === undefined ? '' : value);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      productcode: product?.productcode ?? '',
      productname: product?.productname ?? '',
      unitsinstock: asField(product?.unitsinstock),
      totalunits: asField(product?.totalunits),
      rateperunitcash: asField(product?.rateperunitcash),
      remarks: product?.remarks ?? '',
      isactive: product ? product.isactive !== false : true,
    },
  });
  const { once: submitOnce, submitting } = useSubmitOnce();

  const toNumberOrNull = (value: any) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const onSubmit = async (vals: FormValues) => {
    setLoading(true);
    const payload = {
      ...(product ? { id: product.id } : {}),
      productcode: vals.productcode.trim(),
      productname: vals.productname.trim(),
      unitsinstock: toNumberOrNull(vals.unitsinstock),
      totalunits: toNumberOrNull(vals.totalunits),
      rateperunitcash: toNumberOrNull(vals.rateperunitcash),
      remarks: vals.remarks,
      isactive: !!vals.isactive,
    };

    try {
      const res = await authFetch(isEdit ? '/api/products-update' : '/api/products-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || (isEdit ? 'Failed to update product' : 'Failed to create product'));
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      if (!isEdit) reset();
      router.push(backTo);
    } catch (err: any) {
      toast.error(err?.message || (isEdit ? 'Failed to update product' : 'Failed to create product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Box
        sx={{
          px: 5,
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: theme =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(90deg, rgba(240,248,255,0.65), rgba(225,245,254,0.9))'
              : 'rgba(255,255,255,0.03)'
        }}
      >
        <Box display='flex' alignItems='center' gap={1}>
          <Icon icon='mdi:cube-outline' />
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {isEdit ? 'Edit Product' : 'Create Product'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {isEdit
                ? 'Change the stock, pricing or details of this product.'
                : 'Add a new product with pricing and stock details.'}
            </Typography>
          </Box>
        </Box>
        <Button variant='outlined' onClick={() => router.push(backTo)}>
          {backTo === '/app/productreport' ? 'Back to Inventory in Hand' : 'Back to products'}
        </Button>
      </Box>
      <CardContent>
        <form onSubmit={submitOnce(handleSubmit(onSubmit))} noValidate>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant='h6'>Basics</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='productcode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Code'
                    placeholder='e.g. P-001'
                    error={Boolean(errors.productcode)}
                    helperText={errors.productcode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='productname'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Name'
                    placeholder='e.g. 19L Water Bottle'
                    error={Boolean(errors.productname)}
                    helperText={errors.productname?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='unitsinstock'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Units in Stock'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.unitsinstock)}
                    helperText={errors.unitsinstock?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='totalunits'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Total Units'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.totalunits)}
                    helperText={errors.totalunits?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6'>Pricing</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='rateperunitcash'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Rate per Unit (Cash)'
                    type='number'
                    inputProps={{ min: 0, step: 1 }}
                    error={Boolean(errors.rateperunitcash)}
                    helperText={errors.rateperunitcash?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6'>Notes</Typography>
              <Divider sx={{ mt: 1, mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='remarks'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Remarks / Notes'
                    placeholder='Optional notes about this product'
                    multiline
                    minRows={3}
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name='isactive'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={!!field.value}
                        onChange={(_, v) => field.onChange(v)}
                      />
                    )}
                  />
                }
                label='Active'
              />
            </Grid>

            <Grid item xs={12}>
              <Box display='flex' gap={2}>
                <Button type='submit' variant='contained' disabled={loading || submitting}>
                  {loading ? 'Saving...' : 'Save Product'}
                </Button>
                <Button variant='outlined' onClick={() => router.push(backTo)}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductsForm;
