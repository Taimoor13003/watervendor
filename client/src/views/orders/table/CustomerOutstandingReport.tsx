import React, { useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { formatDisplayDate } from 'src/lib/display-date'

export type OutstandingRow = {
  rowid: string
  orderid: number | null
  orderno: string | null
  orderdate: string | null
  deliveredbyempid: number | null
  employeename: string | null
  deliverydate: string | null
  invoiceno: number | null
  invoicedate: string | null
  orderstatus: string | null
  customerid: number | null
  firstname: string | null
  lastname: string | null
  quantity: number
  returnqty: number
  bottlesoutstanding: number
}

interface CustomerOutstandingReportProps {
  data: OutstandingRow[]

  // Set once a report has been run; the heading reads "For Customer: ...".
  customerName?: string
}

// Null and unparseable dates are common in the imported data; rendering them
// through `new Date(...)` directly produced "Invalid Date" in the grid.
const formatDate = (value: string | null) => formatDisplayDate(value, '—')

const formatNumber = (value: number) => Number(value || 0).toLocaleString()

const bottles = (count: number) => `${formatNumber(count)} Bottle${count === 1 ? '' : 's'}`

const CustomerOutstandingReport: React.FC<CustomerOutstandingReportProps> = ({ data, customerName }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          delivered: acc.delivered + (row.quantity || 0),
          returned: acc.returned + (row.returnqty || 0)
        }),
        { delivered: 0, returned: 0 }
      ),
    [rows]
  )

  const columns: GridColDef[] = [
    {
      flex: 0.14,
      minWidth: 130,
      field: 'orderno',
      headerName: 'Order #',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.orderno || '—'}
        </Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 120,
      field: 'orderdate',
      headerName: 'Order Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>{formatDate(params.row.orderdate)}</Typography>
      )
    },
    {
      flex: 0.18,
      minWidth: 170,
      field: 'employeename',
      headerName: 'Delivered by Employee',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.employeename || (params.row.deliveredbyempid ?? '—')}
        </Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 120,
      field: 'deliverydate',
      headerName: 'Delivery Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>{formatDate(params.row.deliverydate)}</Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 120,
      field: 'invoiceno',
      headerName: 'Invoice No',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.invoiceno ? `RI-${params.row.invoiceno}` : '—'}
        </Typography>
      )
    },
    {
      flex: 0.12,
      minWidth: 120,
      field: 'invoicedate',
      headerName: 'Invoice Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>{formatDate(params.row.invoicedate)}</Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 110,
      field: 'quantity',
      headerName: 'Bottles Order',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>{formatNumber(params.row.quantity)}</Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 110,
      field: 'returnqty',
      headerName: 'Bottles Return',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>{formatNumber(params.row.returnqty)}</Typography>
      )
    }
  ]

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader
          title='Customer Outstanding Report'
          subheader={customerName ? `For Customer: ${customerName}` : undefined}
        />

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rows={rows}
          getRowId={row => row.rowid}
          localeText={{
            noRowsLabel: customerName ? 'No bottles outstanding for this customer' : 'Select a customer and run the report'
          }}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.125rem'
            }
          }}
        />

        <Box sx={{ px: 5, py: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Total Delivered: {bottles(totals.delivered)}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Total Return: {bottles(totals.returned)}
          </Typography>
        </Box>

        <Box sx={{ mx: 5, mb: 5, p: 3, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 1, maxWidth: 360 }}>
          <Typography variant='subtitle2' sx={{ textDecoration: 'underline', textAlign: 'center', mb: 1 }}>
            Total Summary
          </Typography>
          <Typography variant='body2'>Delivered Quantity: {bottles(totals.delivered)}</Typography>
          <Typography variant='body2'>Return Quantity: {bottles(totals.returned)}</Typography>
        </Box>
      </DatePickerWrapper>
    </Card>
  )
}

export default CustomerOutstandingReport
