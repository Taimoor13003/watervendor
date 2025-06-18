// src/views/apps/invoice/AccountForm.tsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

// MUI Components
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Your custom text‐field wrapper
import CustomTextField from 'src/@core/components/mui/text-field'

interface Account {
  accountcode: string
  accountname: string
}

interface FormValues {
  accountCode: string
  accountType: string
  accountName: string
  openingBalance: string
  remarks: string
}

const schema = yup.object().shape({
  accountCode:    yup.string().required('Account Code is required'),
  accountType:    yup.string().required('Account Type is required'),
  accountName:    yup.string().required('Account Name is required'),
  openingBalance: yup.string().required('Opening Balance is required'),
  remarks:        yup.string()
})

const AccountForm: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      accountCode:    '',
      accountType:    '',
      accountName:    '',
      openingBalance: '',
      remarks:        ''
    },
    mode:     'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    axios
      .get<{ accounts: Account[] }>('/api/accountnames')
      .then(res => setAccounts(res.data.accounts))
      .catch(err => {
        console.error(err)
        toast.error('Could not load account list')
      })
  }, [])

  const onSubmit = (data: FormValues) => {
    console.log(data)
    toast.success('Form Submitted')
  }

  return (
    <Card>
      <CardHeader title="Accounts" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>

            {/* Account Code as dropdown */}
            <Grid item xs={12}>
              <Controller
                name="accountCode"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label="Account Code"
                    {...field}
                    error={Boolean(errors.accountCode)}
                    helperText={errors.accountCode?.message}
                  >
                    {accounts.map(acc => (
                      <MenuItem key={acc.accountcode} value={acc.accountcode}>
                        {acc.accountcode} – {acc.accountname}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* All other fields remain plain text inputs */}
            <Grid item xs={12}>
              <Controller
                name="accountType"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Account Type"
                    placeholder="e.g. Asset"
                    {...field}
                    error={Boolean(errors.accountType)}
                    helperText={errors.accountType?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="accountName"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Account Name"
                    placeholder="e.g. Cash"
                    {...field}
                    error={Boolean(errors.accountName)}
                    helperText={errors.accountName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="openingBalance"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Opening Balance"
                    placeholder="0.00"
                    {...field}
                    error={Boolean(errors.openingBalance)}
                    helperText={errors.openingBalance?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label="Remarks / Note"
                    placeholder="Optional"
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Submit button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountForm
