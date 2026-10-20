// src/views/apps/invoice/preview/PreviewCard.tsx

import React from 'react'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'
import TableCell from '@mui/material/TableCell'
import { format } from 'date-fns'
import Image from 'next/image'
import { SingleInvoiceType } from 'src/types/apps/invoiceTypes'
import { buildInvoiceNumber } from 'src/lib/invoice-number'

interface PreviewCardProps {
  data: SingleInvoiceType[] // Expecting an array
  startDate?: string
  endDate?: string
}

const PreviewCard: React.FC<PreviewCardProps> = ({ data, startDate, endDate }) => {
  const theme = useTheme()

  const datanew = Array.isArray(data) ? data : []
  const getLineTotal = (item: any) => {
    if (item.orderamount !== null && item.orderamount !== undefined) return Number(item.orderamount)

    return Number(item.orderqty || 0) * Number(item.rate_per_bottle || 0)
  }
  const totalBottlesDelivered = datanew.reduce((total: number, current) => total + (current.orderqty || 0), 0)
  const totalBottlesReturned = datanew.reduce((total: number, current) => total + (current.returnqty || 0), 0)

  if (datanew.length === 0) {
    return null
  }

  const firstItem = datanew[0] || {}
  const firstname = firstItem?.firstname || 'N/A'
  const lastname = firstItem?.lastname || 'N/A'
  const address = firstItem?.addressres || 'N/A'
  const telephone =
    (firstItem as any)?.telephoneres || (firstItem as any)?.telephoneoffice || (firstItem as any)?.telephone || 'N/A'

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)

    return format(date, 'dd/MM/yyyy')
  }
  const currentDate = format(new Date(), 'EEEE, dd MMMM, yyyy')

  const totalAmountDue = datanew.reduce((total: number, item) => {
    return total + getLineTotal(item)
  }, 0)

  const invoiceNumber = buildInvoiceNumber({
    accountNo: (firstItem as any)?.accountno,
    customerId: (firstItem as any)?.customerid,
    startDate,
    endDate
  })

  return (
    <Card>
      <CardContent sx={{ px: [6, 10] }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: ['8px 0', '20px'],
            gap: 2,
            // Logos shrink on phones instead of pushing the page sideways.
            '& > *': { minWidth: 0 },
            '& img': { maxWidth: '100%', height: 'auto' }
          }}
        >
          <Box sx={{ flex: '1 1 150px' }}>
            <Image src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp' alt='Left' width={150} height={100} />
          </Box>
          {/* Center logo: crop 2px from the right to hide embedded separator line */}
          <Box sx={{ flex: '2 1 330px' }}>
          <Image
            src='/images/avatars/WhatsApp Image 2024-09-04 at 01.17.42_00181990.jpg'
            alt='Center'
            width={330}
            height={150}
            style={{
              objectFit: 'contain',
              display: 'block',
              clipPath: 'inset(0 2px 0 0)'
            }}
          />
          </Box>

          <Box sx={{ flex: '1 1 150px' }}>
            <Image src='/images/avatars/pngwing.com.png' alt='Right' width={150} height={80} />
          </Box>
        </Box>
        {/* Customer block: the invoice has to identify who it is addressed to. */}
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          {[firstname, lastname].filter(name => name && name !== 'N/A').join(' ') || 'N/A'}
        </Typography>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{address}</Typography>
        <Typography>Telephone: {telephone}</Typography>
        <br />
        <Typography>Date: {currentDate}</Typography>
        <Typography variant='h6'>Invoice no.# {invoiceNumber}</Typography>
        <Typography variant='h6'>Account no.# {firstItem.accountno}</Typography>
        <br />

        <Divider />
        <Typography variant='h1' align='center' sx={{ fontSize: ['2rem', '3rem', undefined] }}>
          Invoice Summary
        </Typography>
        <Divider />
      </CardContent>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Date</TableCell>
              <TableCell>Bottles Delivered</TableCell>
              <TableCell>Bottles Returned</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& .MuiTableCell-root': {
                py: `${theme.spacing(2.5)} !important`,
                fontSize: theme.typography.body1.fontSize
              }
            }}
          >
            {datanew.map((newData: any, index) => {
              const amount = getLineTotal(newData)

              return (
                <TableRow key={index}>
                  <TableCell>{formatDate(newData.InvoiceDate)}</TableCell>
                  <TableCell>{newData.orderqty}</TableCell>
                  <TableCell>{newData.returnqty || 0}</TableCell>
                  <TableCell>{newData.rate_per_bottle}</TableCell>
                  <TableCell>{amount}</TableCell>
                </TableRow>
              )
            })}
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                  fontWeight: 700
                }
              }}
            >
              <TableCell>Total</TableCell>
              <TableCell>{totalBottlesDelivered}</TableCell>
              <TableCell>{totalBottlesReturned}</TableCell>
              <TableCell />
              <TableCell>{totalAmountDue}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <CardContent sx={{ px: [6, 10] }}>
        <Typography sx={{ color: 'text.secondary' }}>
          <Typography component='span' sx={{ mr: 1.5, fontWeight: 500, color: 'inherit' }}>
            Note:
          </Typography>
          Total Amount Due is Rs:{totalAmountDue}
        </Typography>
        <Typography>Thank you</Typography>
      </CardContent>
    </Card>
  )
}

export default PreviewCard
