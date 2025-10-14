import React, { ReactNode, useState } from 'react';
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

import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Typography, FormControlLabel, Switch, RadioGroup, Radio, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';

type FormValues = {
  firstname: string;
  lastname: string;
  datefirstcontacted: string;
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
  delivery_person: string;
  reqbottles: string;
  tax: string;
  rate_per_bottle: string;
  // UI-only fields that map to DB booleans
  istaxable?: boolean;
  isdepositvoucherdone?: boolean;
  gender?: string;
};

type EditCustomerFormProps = {
  customerData: FormValues;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: { id: number; paymentmode: string }[];
  deliveryPersons: {
    lastname: ReactNode;
    id: number;
    empid: number;
    employeecode: string;
    firstname: string;
    middlename: string;
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
  delieverydate: yup.string(),
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
  deliveryAreas,
}: EditCustomerFormProps) => {

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      istaxable: false,
      isdepositvoucherdone: false,
      gender: 'Mr',
      ...customerData
    },
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const [openAddArea, setOpenAddArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const onSubmit = async (data: FormValues) => {
    toast.success('Saving customer data...');
    // Map client field `delieverydate` -> API expects `deliverydate`
    const payload = {
      ...data,
      deliverydate: data.delieverydate || null
    } as any
    delete payload.delieverydate

    try {
      const response = await fetch('/api/post_customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast.success('Customer added!');
        router.push('/app/customers');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add customer');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
    console.log(newArea, "newAArea")
    if (!newArea.trim()) {
      toast.error('Please enter a delivery area');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/post_delievery_area', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryarea: newArea }),
      });

      if (response.ok) {
        toast.success('Delivery area added!');
        setOpenAddArea(false);
        setNewArea('');
        window.location.reload(); 
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add delivery area');
      }
    } catch (error) {
      console.error('Error adding delivery area:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArea = async (id: number) => {
    if (!confirm('Are you sure you want to delete this area?')) return;

    try {
      const response = await fetch(`/api/deliveryarea?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Delivery area deleted!');
        // Optionally refreshDeliveryAreas();
      } else {
        toast.error('Failed to delete area');
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      toast.error('Something went wrong');
    }
  };

  return (
    <Card>
      <CardHeader title="Customer Form" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant='h6'>Basic Information</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            {[
              { name: 'firstname', label: 'First Name', placeholder: 'John', colXSSize: 12, colSMSize: 6 },
              { name: 'lastname', label: 'Last Name', placeholder: 'Doe', colSMSize: 6 },
              { name: 'rate_per_bottle', label: 'Rate/Bottle', placeholder: '123456', type: 'number', colSMSize: 6 },
              { name: 'telephoneres', label: 'Delivery Telephone#', placeholder: '123456', type: 'number', colSMSize: 6 },
              { name: 'telephoneoffice', label: 'WhatsAPP Number#', placeholder: '123456', type: 'number', colSMSize: 6 },
              { name: 'datefirstcontacted', label: 'Date First Contacted', type: 'date', colSMSize: 6 },
              { name: 'dateofbirth', label: 'Date Of Birth', type: 'date', colSMSize: 6 },
              { name: 'delieverydate', label: 'Delivery Date', type: 'date', colSMSize: 6 },
              { name: 'depositamount', label: 'Deposit Amount', placeholder: '123456', colSMSize: 6, type: 'number' },
              { name: 'email', label: 'Email Address', colSMSize: 6, },
              { name: 'addressres', label: 'Delivery Address', placeholder: '123456', colSMSize: 6, multiline: true, rows: 2 },
              { name: 'addressoffice', label: 'Office Address', placeholder: '123456', colSMSize: 6, multiline: true, rows: 2 },
              { name: 'notes', label: 'Notes', placeholder: 'Any specific information', colSMSize: 12, multiline: true, rows: 4 },
            ].map((field) => (
              <Grid item 
              xs={field.colXSSize || 12}
              sm={field.colSMSize || 12}
              key={field.name}>
                <Controller
                  name={field.name as keyof FormValues}
                  control={control}
                  render={({ field: controllerField }) => (
                    <CustomTextField
                    fullWidth
                    {...field}
                    {...controllerField}
                    error={Boolean(errors[field.name as keyof FormValues])}
                    helperText={errors[field.name as keyof FormValues]?.message}
                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                    type={field.type || 'text'}
                    inputProps={field.type === 'number' ? { min: 0 } : undefined}
                    />
                  )}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography variant='h6'>Customer Preferences</Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
            </Grid>
            {/* Customer Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="customertype"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.customertype)}>
                    <InputLabel>Customer Type</InputLabel>
                    <Select {...field} label="Customer Type">
                      {customerTypes.map((type) => (
                        <MenuItem key={type.id} value={type.customertype}>
                          {type.customertype}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.customertype?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Requirement and Bottles Per Visit fields */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="requirement"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.requirement)}>
                    <InputLabel>Requirements</InputLabel>
                    <Select {...field} label="Requirements">
                      {pickrequirement.map((req) => (
                        <MenuItem key={req.id} value={req.requirement}>
                          {req.requirement}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.requirement?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="reqbottles"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Bottles Per Visit"
                    placeholder="123456"
                    {...field}
                    error={Boolean(errors.reqbottles)}
                    helperText={errors.reqbottles?.message}
                    type='number'
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>

            {/* Payment Mode Dropdown */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="paymentmode"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.paymentmode)}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select {...field} label="Payment Mode">
                      {paymentmode.map((mode) => (
                        <MenuItem key={mode.id} value={mode.paymentmode}>
                          {mode.paymentmode}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.paymentmode?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Delivery Person Dropdown */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="delivery_person"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Delivery Person</InputLabel>
                    <Select {...field} label="Delivery Person" value={field.value || ''}>
                      {deliveryPersons.map((p) => (
                        <MenuItem key={p.id} value={String(p.id)}>
                          {p.firstname} {p.lastname ? p.lastname : ''} ({p.employeecode})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Delivery Area Dropdown with Add Button */}
            <Grid item xs={12} sm={6}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                  <Controller
                    name="deliveryarea"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.deliveryarea)}>
                        <InputLabel>Delivery Area</InputLabel>
                        <Select {...field} label="Delivery Area" value={field.value || ''}>
                          {deliveryAreas.map((area) => (
                            <MenuItem key={area.id} value={area.deliveryarea}>
                              {area.deliveryarea}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors.deliveryarea?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Button variant="outlined" onClick={() => setOpenAddArea(true)}>
                    Add Area
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Flags and Gender */}
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

            {/* Tax Field */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="tax"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    label="Tax (Percentage)"
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const inputValue = parseFloat(e.target.value);
                      if (inputValue <= 100 || e.target.value === '') {
                        onChange(e);
                      }
                    }}
                    placeholder="Enter tax amount"
                    error={Boolean(errors.tax)}
                    helperText={errors.tax?.message}
                    inputProps={{ max: 100 }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Popup to Add New Delivery Area */}
          <Dialog open={openAddArea} onClose={() => setOpenAddArea(false)}>
            <DialogTitle>Add New Delivery Area</DialogTitle>
            <DialogContent>
              <CustomTextField
                autoFocus
                fullWidth
                label="Delivery Area Name"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Enter new delivery area"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddArea(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddArea} disabled={loading}> {loading ? 'Adding...' : 'Add'}</Button>
            </DialogActions>
          </Dialog>

          <Grid container justifyContent="flex-end" spacing={3} sx={{ mt: 3 }}>
            <Grid item>
              <Button onClick={() => router.push('/app/customers')} variant='outlined' color='secondary' disabled={loading}>
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} /> : undefined}>
                {loading ? 'Saving...' : 'Submit'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditCustomerForm;
