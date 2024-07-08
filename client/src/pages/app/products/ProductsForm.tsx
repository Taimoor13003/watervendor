// ** React Imports
// import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Icon Imports


// interface State {
//   password: string
//   showPassword: boolean
// }

const defaultValues = {
  email: '',
  lastName: '',
  password: '',
  firstName: ''
}

const showErrors = (field: string, valueLen: number, min: number) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  lastName: yup
    .string()
    .min(3, obj => showErrors('lastName', obj.value.length, obj.min))
    .required(),
  password: yup
    .string()
    .min(8, obj => showErrors('password', obj.value.length, obj.min))
    .required(),
  firstName: yup
    .string()
    .min(3, obj => showErrors('firstName', obj.value.length, obj.min))
    .required()
})

const FormValidationSchema = () => {
  // ** States
  // const [state, setState] = useState<State>({
  //   password: '',
  //   showPassword: false
  // })

  // ** Hook
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // const handleClickShowPassword = () => {
  //   setState({ ...state, showPassword: !state.showPassword })
  // }

  const onSubmit = () => toast.success('Form Submitted')

  return (
    <Card>
      <CardHeader title='Products Form' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Controller
                name='firstName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Customer Name'
                    onChange={onChange}
                    placeholder='Leonard'
                    error={Boolean(errors.firstName)}
                    aria-describedby='validation-schema-first-name'
                    {...(errors.firstName && { helperText: errors.firstName.message })}
                  />

                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Customer Type'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Customer Account#'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Date Of Birth'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Telephone#'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Office Telephone#'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Address'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Office Address'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Fax#'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='EmaiL Address'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Date First Contacted'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Date'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Area'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Payment Mode'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Remarks/Note'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Delivery Person'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Requirement'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Bottles per'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Deposit Amount'
                    onChange={onChange}
                    placeholder='Carter'
                    error={Boolean(errors.lastName)}
                    aria-describedby='validation-schema-last-name'
                    {...(errors.lastName && { helperText: errors.lastName.message })}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type='email'
                    value={value}
                    label='Email'
                    onChange={onChange}
                    error={Boolean(errors.email)}
                    placeholder='carterleonard@gmail.com'
                    aria-describedby='validation-schema-email'
                    {...(errors.email && { helperText: errors.email.message })}
                  />
                )}
              />
            </Grid> */}
            {/* <Grid item xs={12}>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    value={value}
                    label='Password'
                    onChange={onChange}
                    id='validation-schema-password'
                    error={Boolean(errors.password)}
                    type={state.showPassword ? 'text' : 'password'}
                    {...(errors.password && { helperText: errors.password.message })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={handleClickShowPassword}
                            onMouseDown={e => e.preventDefault()}
                            aria-label='toggle password visibility'
                          >
                            <Icon fontSize='1.25rem' icon={state.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default FormValidationSchema
