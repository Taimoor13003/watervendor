import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CustomTextField from 'src/@core/components/mui/text-field';

type EditProductFormProps = {
  productData: {
    id: number;
    productcode: string;
    productname: string;
    unitsinstock: number;
    totalunits: number;
    rateperunitcash: number;
    rateperunitcoupon: number;
    remarks: string;
    isactive?: boolean | null;
  };
};

const EditProductsForm = ({ productData }: EditProductFormProps) => {
  return (
    <Card>
      <CardHeader title='Product Details' subheader='Read-only view' />
      <CardContent>
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Product Code'
              value={productData.productcode ?? ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Product Name'
              value={productData.productname ?? ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Units in Stock'
              value={productData.unitsinstock ?? ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Total Units'
              value={productData.totalunits ?? ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Rate Per Unit (Cash)'
              value={productData.rateperunitcash ?? ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label='Remarks / Note'
              value={productData.remarks ?? ''}
              multiline
              minRows={3}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Active'
              value={productData.isactive ? 'Yes' : 'No'}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EditProductsForm;
