import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { formatDisplayDate } from 'src/lib/display-date'
import { vouchertypes } from 'src/constant'

export interface AccountDetailRow {
  id: number | string
  voucherno: string | number
  accountcode: string
  voucherdate: string
  vouchertype?: number | null
  description?: string | null
  chqno?: string | null
  debitamount: number
  creditamount: number
}

// Voucher type names as the desktop RMS prints them on this report.
export const voucherTypeLabel = (type: number | null | undefined) => {
  const name = vouchertypes.find(voucherType => voucherType.id === type)?.name

  return name ? name.replace(/\b\w/g, letter => letter.toUpperCase()) : ''
}

const formatAmount = (value: number) =>
  Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface Props {
  data: AccountDetailRow[]
  accountTitle: string
  periodFrom: string
  periodTo: string
}

// Laid out like the desktop RMS "Accounts Details" report: one line per voucher
// in the period with the voucher's narration under it, and the debit and credit
// totals at the foot. No opening or running balance, the same as the desktop.
const AccountDetailsTable = ({ data, accountTitle, periodFrom, periodTo }: Props) => {
  const totalDebitAmount = data.reduce((sum, row) => sum + (row.debitamount || 0), 0)
  const totalCreditAmount = data.reduce((sum, row) => sum + (row.creditamount || 0), 0)

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' fontWeight={700}>
          Accounts Details
        </Typography>
        <Typography variant='body2'>For Account title: {accountTitle}</Typography>
        <Typography variant='body2'>
          From period: {formatDisplayDate(periodFrom)} to {formatDisplayDate(periodTo)}
        </Typography>
      </CardContent>

      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Sr. #</TableCell>
              <TableCell>Voucher Date</TableCell>
              <TableCell>Voucher No.</TableCell>
              <TableCell>Voucher Type</TableCell>
              <TableCell>Chq. #</TableCell>
              <TableCell align='right'>Debit Amount</TableCell>
              <TableCell align='right'>Credit Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell sx={{ verticalAlign: 'top' }}>
                  {index + 1}
                  {row.description && (
                    <Typography variant='caption' display='block' color='text.secondary'>
                      {row.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  {formatDisplayDate(row.voucherdate)}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{row.voucherno}</TableCell>
                <TableCell sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  {voucherTypeLabel(row.vouchertype)}
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top' }}>{row.chqno || ''}</TableCell>
                <TableCell align='right' sx={{ verticalAlign: 'top' }}>
                  {formatAmount(row.debitamount)}
                </TableCell>
                <TableCell align='right' sx={{ verticalAlign: 'top' }}>
                  {formatAmount(row.creditamount)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { fontWeight: 700, borderTop: theme => `2px solid ${theme.palette.divider}` } }}>
              <TableCell colSpan={5}>Total ({data.length} vouchers)</TableCell>
              <TableCell align='right'>{formatAmount(totalDebitAmount)}</TableCell>
              <TableCell align='right'>{formatAmount(totalCreditAmount)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default AccountDetailsTable
