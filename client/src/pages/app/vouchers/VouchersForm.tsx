// src/pages/app/vouchers/VouchersForm.tsx

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Box,
  FormHelperText
} from '@mui/material'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { vouchertypes } from 'src/constant'

// ------------ validation schema ------------
const schema = yup.object({
  voucherNo: yup.string(),
  vouchertype: yup.string().required('Voucher Type is required'),
  description: yup.string().required('Description is required'),
  voucherdate: yup.date().required('Voucher Date is required'),
  accountCode: yup.string().required('Account Code is required'),
  creditAmount: yup
    .number()
    .typeError('Credit must be a number')
    .min(0, 'Cannot be negative')
    .required('Credit Amount is required'),
  debitAmount: yup
    .number()
    .typeError('Debit must be a number')
    .min(0, 'Cannot be negative')
    .required('Debit Amount is required'),
})

type FormValues = yup.InferType<typeof schema>

const RequiredLabel = ({ label }: { label: string }) => (
  <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
    <span>{label}</span>
    <Box component='span' sx={{ color: 'error.main', fontWeight: 700 }}>*</Box>
  </Box>
)

const VouchersForm: React.FC = () => {
  // 1) form setup, now including getValues
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      voucherNo: '',
      vouchertype: '',
      description: '',
      // @ts-ignore
      voucherdate: '',
      accountCode: '',
      creditAmount: 0,
      debitAmount: 0
    }
  })

  const selectedType = useWatch({ control, name: 'vouchertype' })

  const [codes, setCodes] = useState<string[]>([])
  const [loadingCodes, setLoadingCodes] = useState(false)

  useEffect(() => {
    if (!selectedType) {
      setCodes([])
      return
    }
    const url =
      selectedType === 'Received Voucher'
        ? '/api/recieved'
        : '/api/accountnames'

    setLoadingCodes(true)
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCodes(data.map((d: any) => d.accountno))
        } else if (Array.isArray(data.accounts)) {
          setCodes(data.accounts.map((a: any) => a.accountcode))
        } else {
          setCodes([])
        }
      })
      .catch(err => {
        console.error('Failed to load account codes:', err)
        setCodes([])
      })
      .finally(() => setLoadingCodes(false))
  }, [selectedType])

  // 4) transaction rows + totals
  const [rows, setRows] = useState<
    { accountCode: string; debit: number; credit: number }[]
  >([])
  const [totals, setTotals] = useState({ debit: 0, credit: 0 })

  const onMove = () => {
    const vals = getValues()
    const ac = vals.accountCode
    const db = Number(vals.debitAmount)
    const cr = Number(vals.creditAmount)
    if (!ac || (db === 0 && cr === 0)) return

    const next = [...rows, { accountCode: ac, debit: db, credit: cr }]
    setRows(next)
    setTotals({
      debit: next.reduce((s, r) => s + r.debit, 0),
      credit: next.reduce((s, r) => s + r.credit, 0)
    })

    // reset just debit & credit fields
    reset({ ...vals, debitAmount: 0, creditAmount: 0 })
  }

  // 5) final submit
  const onSubmit = async (vals: FormValues) => {
    try {
      await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vals, transactions: rows })
      })
      toast.success('Voucher created!')
      reset()
      setRows([])
      setTotals({ debit: 0, credit: 0 })
    } catch (err) {
      console.error(err)
      toast.error('Failed to create voucher')
    }
  }

  return (
    <Card>
      <CardHeader title='Create Voucher' subheader='Record voucher details and transactions.' />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={4}>
            {/* Voucher # */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='voucherNo'
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth disabled label='Voucher #' />
                )}
              />
            </Grid>

            {/* Voucher Type */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='vouchertype'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.vouchertype}>
                    <InputLabel required>Voucher Type</InputLabel>
                    <Select {...field} label='Voucher Type'>
                      {vouchertypes.map(t => (
                        <MenuItem key={t.id} value={t.name}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.vouchertype && <FormHelperText>{errors.vouchertype.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12} md={8}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={<RequiredLabel label='Description' />}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    multiline
                    minRows={2}
                  />
                )}
              />
            </Grid>

            {/* Voucher Date */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='voucherdate'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={<RequiredLabel label='Voucher Date' />}
                    type='date'
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.voucherdate}
                    helperText={errors.voucherdate?.message}
                  />
                )}
              />
            </Grid>

            {/* Account Code */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='accountCode'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.accountCode}>
                    <InputLabel required>Account Code</InputLabel>
                    <Select {...field} label='Account Code' disabled={loadingCodes}>
                      {loadingCodes ? (
                        <MenuItem value=''>
                          <CircularProgress size={20} />
                        </MenuItem>
                      ) : (
                        codes.map(c => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.accountCode && <FormHelperText>{errors.accountCode.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Debit Amount */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='debitAmount'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={<RequiredLabel label='Debit Amount' />}
                    type='number'
                    inputProps={{ min: 0, step: '0.01' }}
                    error={!!errors.debitAmount}
                    helperText={errors.debitAmount?.message}
                  />
                )}
              />
            </Grid>

            {/* Credit Amount */}
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name='creditAmount'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={<RequiredLabel label='Credit Amount' />}
                    type='number'
                    inputProps={{ min: 0, step: '0.01' }}
                    error={!!errors.creditAmount}
                    helperText={errors.creditAmount?.message}
                  />
                )}
              />
            </Grid>

            {/* Move */}
            <Grid item xs={12}>
              <Button onClick={onMove} variant='outlined'>
                Move
              </Button>
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                disabled={isSubmitting}
              >
                Submit Voucher
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Transactions Table */}
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Code</TableCell>
                <TableCell align='right'>Debit Amount</TableCell>
                <TableCell align='right'>Credit Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.accountCode}</TableCell>
                  <TableCell align='right'>{r.debit.toFixed(2)}</TableCell>
                  <TableCell align='right'>{r.credit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Totals</strong></TableCell>
                <TableCell align='right'><strong>{totals.debit.toFixed(2)}</strong></TableCell>
                <TableCell align='right'><strong>{totals.credit.toFixed(2)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default VouchersForm
