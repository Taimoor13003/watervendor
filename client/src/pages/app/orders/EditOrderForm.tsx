import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, InputLabel, Select, FormHelperText } from '@mui/material';

type Order = {
  accountclosedate: Date | null;
  accountno: string;
  addressoffice: string;
  addressres: string;
  areaoffice: string | null;
  areares: string | null;
  customerid: number;
  customertype: string;
  datefirstcontacted: Date | null;
  dateofbirth: Date | null;
  deliveredbyempid: number;
  deliveredbyvehicleregid: string;
  delivery_person: number;
  deliveryaddress: string;
  deliveryarea: string;
  deliverydate: Date | null;
  deliveryno: string | null;
  deliverynotes: string;
  depositamount: number;
  email: string;
  fax: string;
  firstname: string;
  id: number;
  invoicedate: Date;
  invoicelastprintdate: Date | null;
  invoiceno: string;
  isdeleted: boolean;
  isdepositvoucherdone: boolean;
  isinvoiceprinted: boolean;
  ispaymentreceived: boolean;
  istaxable: boolean;
  lastname: string;
  middlename: string;
  modifybyuser: number;
  modifydate: Date | null;
  notes: string;
  orderamount: number;
  orderdate: Date;
  orderid: number;
  orderno: string;
  orderqty: number;
  orderstatus: string;
  paymentmode: string;
  rate_per_bottle: number;
  reqbottles: number;
  requirement: string;
  telephone: string;
  telephoneext: string;
  telephoneoffice: string;
  telephoneres: string;
  bottlesReturnedDate:Date;
};
type OrderDetail = {
  bottlereturndate: Date | null;
  id: number;
  orderdetailid: number;
  orderid: number;
  productid: number;
  quantity: number;
  returnqty: number;
  unitprice: number;
};
type OrderEditFormProps = {
  orderdetails: OrderDetail;

  data: Order;
};

const schema = yup.object().shape({
  orderno: yup.string().required(),
  accountno: yup.string().required(),
  customerid: yup.number().required(),
  paymentmode: yup.string().required(),
  orderdate: yup.date().required(),
  orderstatus: yup.string().required(),
  orderamount: yup.number().required(),
  orderqty: yup.number().required(),
  deliverydate: yup.date(),
  delivery_person: yup.number().required(),
  deliveryaddress: yup.string().required(),
  deliveryarea: yup.string().required(),
  deliverynotes: yup.string(),
  bottlereturndate: yup.date(),
  productid: yup.number().required(),
  returnqty: yup.number().required(),
  unitprice: yup.number().required(),
  bottlereturndate: yup.date().required()

});

const OrderEditForm = ({ data, paymentmode, orderdetails }: OrderEditFormProps) => {
  const orderDetail = JSON.parse( orderdetails)[0] || {};
  console.log(orderDetail,"dataorder")
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...data,
      ...orderdetails,
      fullname: `${data.firstname} ${data.lastname}`,
      productid:orderDetail.productid || '',
      unitprice:orderDetail.unitprice || '',
      bottlereturndate:orderDetail.bottleretundate ||'',
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });


console.log(data,"whole")
  // Function to update the combined field
  const updateFullName = (firstname: string, lastname: string) => {
    setValue('fullname', `${firstname}${lastname}`);
  };
console.log(orderdetails,"orderdetails")
  const onSubmit = (formData: any) => {
    console.log(formData);
    toast.success('Form Submitted');
  };
  return (
    <Card>
      <CardHeader title="Edit Order Form" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Account Number */}
            <Grid item xs={12}>
              <Controller
                name="orderno"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Order Number"
                    placeholder="Order Number"
                    error={Boolean(errors.orderno)}
                    helperText={errors.orderno?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="fullname"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Customer Name"
                    placeholder="Name"
                    error={Boolean(errors.fullname)}
                    helperText={errors.fullname?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="productid"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Product ID"
                    placeholder="Product ID"
                    error={Boolean(errors.productid)}
                    helperText={errors.productid?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Payment Mode */}
            <Grid item xs={12}>
              <Controller
                name='paymentmode'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select {...field} label='Payment Mode' fullWidth defaultValue=''>
                      {paymentmode.map((mode: { id: React.Key | null | undefined; paymentmode: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | null | undefined; }) => (
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

            {/* Order Date */}
            <Grid item xs={12}>
              <Controller
                name="orderdate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Order Date"
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Order Date"
                        error={Boolean(errors.orderdate)}
                        helperText={errors.orderdate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Order Status */}
            <Grid item xs={12}>
              <Controller
                name="orderstatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Order Status"
                    error={Boolean(errors.orderstatus)}
                    helperText={errors.orderstatus?.message}
                    {...field}
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Canceled">Canceled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>



            <Grid item xs={12}>
              <Controller
                name="orderqty"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Quantity"
                    placeholder="Order Quantity"
                    type="number"
                    error={Boolean(errors.orderqty)}
                    helperText={errors.orderqty?.message}
                    {...field}
                  />
                )}
              />
            </Grid>


            {/* Delivery Notes */}
            <Grid item xs={12}>
              <Controller
                name="deliverynotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery Remarks/Notes"
                    placeholder="Delivery Notes"
                    error={Boolean(errors.deliverynotes)}
                    helperText={errors.deliverynotes?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="unitprice"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Unit Price"
                    placeholder="Unit Price"
                    type="number"
                    error={Boolean(errors.unitprice)}
                    helperText={errors.unitprice?.message}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="bottlereturndate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Bottle Return Date"
                      dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Bottle Return Date"
                        error={Boolean(errors.bottlereturndate)}
                        helperText={errors.bottlereturndate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="returnqty"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Returned Quantity"
                    placeholder="Order Quantity"
                    type="number"
                    error={Boolean(errors.returnqty)}
                    helperText={errors.returnqty?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            

            {/* Delivery Date */}
            <Grid item xs={12}>
              <Controller
                name="deliverydate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    placeholderText="Select Delivery Date"
                    dateFormat="MM/dd/yyyy"
                    customInput={
                      <TextField
                        fullWidth
                        label="Delivery Date"
                        error={Boolean(errors.deliverydate)}
                        helperText={errors.deliverydate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>
            {/* Delivery Notes */}
            <Grid item xs={12}>
              <Controller
                name="deliveredbyvehicleregid"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery by Vehicle (Registration #)"
                    placeholder="Delivery Notes"
                    error={Boolean(errors.deliverynotes)}
                    helperText={errors.deliverynotes?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Delivery Person */}
            <Grid item xs={12}>
              <Controller
                name="delivery_person"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery by Employee"
                    placeholder="Delivery by Employee"
                    type="number"
                    error={Boolean(errors.delivery_person)}
                    helperText={errors.delivery_person?.message}
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Delivery Address */}
            <Grid item xs={12}>
              <Controller
                name="deliveryaddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery Address"
                    placeholder="Delivery Address"
                    error={Boolean(errors.deliveryaddress)}
                    helperText={errors.deliveryaddress?.message}
                    {...field}
                  />
                )}
              />
            </Grid>



            {/* Delivery Notes */}
            <Grid item xs={12}>
              <Controller
                name="deliverynotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Delivery Remarks/Notes"
                    placeholder="Delivery Notes"
                    error={Boolean(errors.deliverynotes)}
                    helperText={errors.deliverynotes?.message}
                    {...field}
                  />
                )}
              />
            </Grid>




            {/* Submit Button */}
            <Grid item xs={12}>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderEditForm; 
// order number ,paymentmode,orderDate,orderstatus,deliverydate,orderdate,quantity