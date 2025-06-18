// import React, { ReactNode } from 'react';
// import Card from '@mui/material/Card';
// import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
// import CardHeader from '@mui/material/CardHeader';
// import CardContent from '@mui/material/CardContent';
// import CustomTextField from 'src/@core/components/mui/text-field';
// import * as yup from 'yup';
// import toast from 'react-hot-toast';
// import { useForm, Controller } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

// type FormValues = {
//   firstname: string;
//   lastname: string;
//   datefirstcontacted: string;
//   customertype: string;
//   dateofbirth: string;
//   accountno: string;
//   telephoneres: string;
//   telephoneoffice: string;
//   addressres: string;
//   email: string;
//   delieverydate: string;
//   deliveryarea: string;
//   paymentmode: string;
//   notes: string;
//   addressoffice: string;
//   depositamount: string;
//   requirement: string;
//   delivery_person: string;
//   reqbottles: string;
//   tax: string;

// };

// type EditCustomerFormProps = {
//   customerData: FormValues;
//   customerTypes: { id: number; customertype: string }[];
//   pickrequirement: { id: number; requirement: string }[];
//   paymentmode: { id: number; paymentmode: string }[];
//   deliveryPersons: {
//     lastname: ReactNode; id: number; empid: number; employeecode: string; firstname: string; middlename: string
//   }[];
//   deliveryAreas: { id: number; name: string }[]; // ✅ Add this line

// };

// const schema = yup.object().shape({
//   firstname: yup.string().required(),
//   lastname: yup.string().required(),
//   datefirstcontacted: yup.string().required(),
//   customertype: yup.string().required(),
//   dateofbirth: yup.string().required(),
//   accountno: yup.string().required(),
//   telephoneres: yup.string().required(),
//   telephoneoffice: yup.string().required(),
//   addressres: yup.string().required(),
//   email: yup.string().required(),
//   delieverydate: yup.string().required(),
//   deliveryarea: yup.string().required(),
//   paymentmode: yup.string().required(),
//   notes: yup.string().required(),
//   addressoffice: yup.string().required(),
//   depositamount: yup.string().required(),
//   requirement: yup.string().required(),
//   delivery_person: yup.string().required(),
//   reqbottles: yup.string().required()
// });

// const EditCustomerForm = ({ customerData, customerTypes, pickrequirement, paymentmode }: EditCustomerFormProps) => {
//   const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
//     defaultValues: customerData,
//     mode: 'onChange',
//     resolver: yupResolver(schema)
//   });

//   const onSubmit = (data: FormValues) => {
//     toast.success('Form Submitted');
//     console.log(data);
//   };

//   return (
//     <Card>
//       <CardHeader title='Customer Form' />
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <Grid container spacing={5}>
//             <Grid item xs={12}>
//               <Controller
//                 name='firstname'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='First Name'
//                     placeholder='John'
//                     error={Boolean(errors.firstname)}
//                     helperText={errors.firstname?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='lastname'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Last Name'
//                     placeholder='Doe'
//                     error={Boolean(errors.lastname)}
//                     helperText={errors.lastname?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='customertype'
//                 control={control}
//                 render={({ field }) => (
//                   <FormControl fullWidth error={Boolean(errors.customertype)}>
//                     <InputLabel>Customer Type</InputLabel>
//                     <Select {...field} label='Customer Type' defaultValue=''>
//                       {customerTypes.map((type) => (
//                         <MenuItem key={type.id} value={type.customertype}>
//                           {type.customertype}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.customertype && <FormHelperText>{errors.customertype.message}</FormHelperText>}
//                   </FormControl>
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='tax'
//                 control={control}
//                 rules={{
//                   required: true,
//                   validate: value => {
//                     const parsedValue = parseFloat(value);

//                     return !isNaN(parsedValue) && parsedValue <= 100 || 'Tax cannot be more than 100';
//                   },
//                 }}
//                 render={({ field: { value, onChange } }) => (
//                   <CustomTextField
//                     fullWidth
//                     value={value}
//                     label='Tax (Percentage)'
//                     onChange={e => {
//                       const inputValue = parseFloat(e.target.value);
//                       if (inputValue <= 100 || e.target.value === '') {
//                         onChange(e);
//                       }
//                     }}
//                     placeholder='Enter tax amount'
//                     type='number'
//                     error={Boolean(errors.tax)}
//                     aria-describedby='validation-schema-tax'
//                     {...(errors.tax && { helperText: errors.tax.message })}
//                     inputProps={{ max: 100 }}
//                   />
//                 )}
//               />

//             </Grid>

//             <Grid item xs={12}>
//               <Controller
//                 name='requirement'
//                 control={control}
//                 render={({ field }) => (
//                   <FormControl fullWidth error={Boolean(errors.requirement)}>
//                     <InputLabel>Requirements</InputLabel>
//                     <Select {...field} label='Requirements' defaultValue=''>
//                       {pickrequirement.map((req) => (
//                         <MenuItem key={req.id} value={req.requirement}>
//                           {req.requirement}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.requirement && <FormHelperText>{errors.requirement.message}</FormHelperText>}
//                   </FormControl>
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='paymentmode'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Rate/Bottle '
//                     placeholder='123456'
//                     error={Boolean(errors.accountno)}
//                     helperText={errors.accountno?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='paymentmode'
//                 control={control}
//                 render={({ field }) => (
//                   <FormControl fullWidth error={Boolean(errors.paymentmode)}>
//                     <InputLabel>Payment Mode</InputLabel>
//                     <Select {...field} label='Payment Mode' defaultValue=''>
//                       {paymentmode.map((mode) => (
//                         <MenuItem key={mode.id} value={mode.paymentmode}>
//                           {mode.paymentmode}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.paymentmode && <FormHelperText>{errors.paymentmode.message}</FormHelperText>}
//                   </FormControl>
//                 )}
//               />
//             </Grid>

//             <Grid item xs={12}>
//               <Controller
//                 name='dateofbirth'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Date Of Birth'
//                     type='date'
//                     InputLabelProps={{ shrink: true }}
//                     error={Boolean(errors.dateofbirth)}
//                     helperText={errors.dateofbirth?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='telephoneres'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Delivery Telephone#'
//                     placeholder='123456'
//                     error={Boolean(errors.telephoneres)}
//                     helperText={errors.telephoneres?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='telephoneoffice'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='WhatsAPP Number#'
//                     placeholder='123456'
//                     error={Boolean(errors.telephoneoffice)}
//                     helperText={errors.telephoneoffice?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='addressres'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Delivery Address'
//                     placeholder='123456'
//                     error={Boolean(errors.addressres)}
//                     helperText={errors.addressres?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='email'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Email Address'
//                     InputLabelProps={{ shrink: true }}
//                     error={Boolean(errors.email)}
//                     helperText={errors.email?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='datefirstcontacted'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Date First Contacted'
//                     type='date'
//                     InputLabelProps={{ shrink: true }}
//                     error={Boolean(errors.datefirstcontacted)}
//                     helperText={errors.datefirstcontacted?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='delieverydate'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Delivery Date'
//                     InputLabelProps={{ shrink: true }}
//                     error={Boolean(errors.delieverydate)}
//                     helperText={errors.delieverydate?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name="deliveryarea"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <FormControl fullWidth error={Boolean(errors.deliveryarea)}>
//                     <InputLabel id="deliveryarea-label">Delivery Area</InputLabel>
//                     <Select
//                       labelId="deliveryarea-label"
//                       id="deliveryarea-select"
//                       label="Delivery Area"
//                       {...field}
//                       value={field.value || ''}
//                     >
//                       {deliveryAreas.map((area) => (
//                         <MenuItem key={area.id} value={area.name}>
//                           {area.name}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {errors.deliveryarea && (
//                       <FormHelperText>{errors.deliveryarea.message}</FormHelperText>
//                     )}
//                   </FormControl>
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='addressoffice'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Office Address'
//                     placeholder='123456'
//                     error={Boolean(errors.addressoffice)}
//                     helperText={errors.addressoffice?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='depositamount'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Deposit Amount'
//                     placeholder='123456'
//                     error={Boolean(errors.depositamount)}
//                     helperText={errors.depositamount?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name='notes'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Notes'
//                     placeholder='Any specific information'
//                     error={Boolean(errors.notes)}
//                     helperText={errors.notes?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>

//             <Grid item xs={12}>
//               <Controller
//                 name='reqbottles'
//                 control={control}
//                 render={({ field }) => (
//                   <CustomTextField
//                     fullWidth
//                     label='Required Bottles'
//                     placeholder='123456'
//                     error={Boolean(errors.reqbottles)}
//                     helperText={errors.reqbottles?.message}
//                     {...field}
//                   />
//                 )}
//               />
//             </Grid>
//           </Grid>
//           <Grid container justifyContent='flex-end' spacing={3} sx={{ mt: 3 }}>
//             <Grid item>
//               <Button type='submit' variant='contained'>
//                 Submit
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };
// export default EditCustomerForm;

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
import IconButton from '@mui/material/IconButton';

import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

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
  datefirstcontacted: yup.string().required(),
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
  reqbottles: yup.string().required(),
  tax: yup.string().required(),
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
    defaultValues: customerData,
    mode: 'onChange',
    resolver: yupResolver(schema),
  });

  const [openAddArea, setOpenAddArea] = useState(false);
  const [newArea, setNewArea] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: FormValues) => {
    toast.success('Form Submitted');
    console.log('Form Data:', data);
  };

  const handleAddArea = async () => {
    if (!newArea.trim()) {
      toast.error('Please enter a delivery area');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/deliveryarea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryarea: newArea }),
      });

      if (response.ok) {
        toast.success('Delivery area added!');
        setOpenAddArea(false);
        setNewArea('');
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
            {[
              { name: 'firstname', label: 'First Name', placeholder: 'John' },
              { name: 'lastname', label: 'Last Name', placeholder: 'Doe' },
              { name: 'accountno', label: 'Rate/Bottle', placeholder: '123456' },
              { name: 'telephoneres', label: 'Delivery Telephone#', placeholder: '123456' },
              { name: 'telephoneoffice', label: 'WhatsAPP Number#', placeholder: '123456' },
              { name: 'addressres', label: 'Delivery Address', placeholder: '123456' },
              { name: 'email', label: 'Email Address' },
              { name: 'datefirstcontacted', label: 'Date First Contacted', type: 'date' },
              { name: 'dateofbirth', label: 'Date Of Birth', type: 'date' },
              { name: 'delieverydate', label: 'Delivery Date', type: 'date' },
              { name: 'addressoffice', label: 'Office Address', placeholder: '123456' },
              { name: 'depositamount', label: 'Deposit Amount', placeholder: '123456' },
              { name: 'notes', label: 'Notes', placeholder: 'Any specific information' },
            ].map((field) => (
              <Grid item xs={12} key={field.name}>
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
                    />
                  )}
                />
              </Grid>
            ))}

            {/* Customer Type Dropdown */}
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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

            <Grid item xs={12}>
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
                  />
                )}
              />
            </Grid>

            {/* Payment Mode Dropdown */}
            <Grid item xs={12}>
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

            {/* Delivery Area Dropdown with Add Button */}
            <Grid item xs={12}>
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
                  <Button fullWidth variant="contained" onClick={() => setOpenAddArea(true)}>
                    Add Area
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Tax Field */}
            <Grid item xs={12}>
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
              <Button type="submit" variant="contained">
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
