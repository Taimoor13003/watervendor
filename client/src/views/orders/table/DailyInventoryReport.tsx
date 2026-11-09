import React, { useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { formatDisplayDate } from 'src/lib/display-date'

export type DailyInventoryDay = {
  day: string
  delivered: number
  returned: number
  extraout: number
  extrain: number
}

export type DailyInventoryCustomerRow = {
  rowid: number
  day: string
  orderid: number | null
  orderno: string | null
  customerid: number | null
  firstname: string | null
  lastname: string | null
  quantity: number
  returnqty: number

  // Bottles given minus bottles taken back: positive went out extra, negative came back extra.
  extra: number
}

interface DailyInventoryReportProps {
  days: DailyInventoryDay[]
  customers: DailyInventoryCustomerRow[]

  // Set once a report has been run, e.g. "01/08/2026 – 07/08/2026".
  period?: string
}

const formatNumber = (value: number) => Number(value || 0).toLocaleString()

const bottles = (count: number) => `${formatNumber(count)} Bottle${count === 1 ? '' : 's'}`

const customerLabel = (row: DailyInventoryCustomerRow) =>
  [row.firstname, row.lastname].filter(Boolean).join(' ') || (row.customerid ? `Customer #${row.customerid}` : '—')

const numberColumn = (field: string, headerName: string, render?: (row: any) => React.ReactNode): GridColDef => ({
  flex: 0.12,
  minWidth: 120,
  field,
  headerName,
  align: 'right',
  headerAlign: 'right',
  renderCell: (params: GridRenderCellParams) => (
    <Typography variant='body2' sx={{ color: 'text.primary' }}>
      {render ? render(params.row) : formatNumber(params.row[field])}
    </Typography>
  )
})

const dateColumn: GridColDef = {
  flex: 0.12,
  minWidth: 120,
  field: 'day',
  headerName: 'Date',
  renderCell: (params: GridRenderCellParams) => (
    <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
      {formatDisplayDate(params.row.day, '—')}
    </Typography>
  )
}

const DailyInventoryReport: React.FC<DailyInventoryReportProps> = ({ days, customers, period }) => {
  const [daysPagination, setDaysPagination] = useState({ page: 0, pageSize: 25 })
  const [customersPagination, setCustomersPagination] = useState({ page: 0, pageSize: 25 })

  const totals = useMemo(
    () =>
      days.reduce(
        (acc, row) => ({
          delivered: acc.delivered + (row.delivered || 0),
          returned: acc.returned + (row.returned || 0),
          extraout: acc.extraout + (row.extraout || 0),
          extrain: acc.extrain + (row.extrain || 0)
        }),
        { delivered: 0, returned: 0, extraout: 0, extrain: 0 }
      ),
    [days]
  )

  const dayColumns: GridColDef[] = [
    dateColumn,
    numberColumn('delivered', 'Bottles Delivered'),
    numberColumn('returned', 'Bottles Returned'),
    numberColumn('extraout', 'Extra Given'),
    numberColumn('extrain', 'Extra Received'),
    numberColumn('net', 'Net Out', row => formatNumber(row.extraout - row.extrain))
  ]

  const customerColumns: GridColDef[] = [
    dateColumn,
    {
      flex: 0.14,
      minWidth: 130,
      field: 'orderno',
      headerName: 'Order #',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.orderno || '—'}
        </Typography>
      )
    },
    {
      flex: 0.24,
      minWidth: 200,
      field: 'customer',
      headerName: 'Customer',
      valueGetter: params => customerLabel(params.row),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {customerLabel(params.row)}
        </Typography>
      )
    },
    numberColumn('quantity', 'Bottles Delivered'),
    numberColumn('returnqty', 'Bottles Returned'),
    numberColumn('extra', 'Extra', row =>
      row.extra > 0 ? `${formatNumber(row.extra)} given` : `${formatNumber(-row.extra)} received`
    )
  ]

  const emptyLabel = period ? 'No bottles moved in this period' : 'Select the dates and run the report'

  return (
    <>
      <Card>
        <CardHeader title='Daily Inventory Report' subheader={period ? `For: ${period}` : undefined} />

        <DataGrid
          autoHeight
          columns={dayColumns}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={daysPagination}
          onPaginationModelChange={setDaysPagination}
          rows={days}
          getRowId={row => row.day}
          localeText={{ noRowsLabel: emptyLabel }}
        />

        <Box sx={{ mx: 5, my: 5, p: 3, border: theme => `1px solid ${theme.palette.divider}`, borderRadius: 1, maxWidth: 360 }}>
          <Typography variant='subtitle2' sx={{ textDecoration: 'underline', textAlign: 'center', mb: 1 }}>
            Total Summary
          </Typography>
          <Typography variant='body2'>Delivered: {bottles(totals.delivered)}</Typography>
          <Typography variant='body2'>Returned: {bottles(totals.returned)}</Typography>
          <Typography variant='body2'>Extra Given: {bottles(totals.extraout)}</Typography>
          <Typography variant='body2'>Extra Received: {bottles(totals.extrain)}</Typography>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            Net Out: {bottles(totals.extraout - totals.extrain)}
          </Typography>
        </Box>
      </Card>

      <Card sx={{ mt: 5 }}>
        <CardHeader title='Customers with Extra Bottles' />

        <DataGrid
          autoHeight
          columns={customerColumns}
          pageSizeOptions={[25, 50, 100]}
          paginationModel={customersPagination}
          onPaginationModelChange={setCustomersPagination}
          rows={customers}
          getRowId={row => row.rowid}
          localeText={{ noRowsLabel: period ? 'No customer was given or returned extra bottles' : emptyLabel }}
        />
      </Card>
    </>
  )
}

export default DailyInventoryReport
