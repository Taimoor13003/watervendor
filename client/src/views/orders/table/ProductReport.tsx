import React, { useMemo, useState, ChangeEvent } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

export type ProductRow = {
  id: number
  productid: number | null
  productcode: string | null
  productname: string | null
  unitsinstock: number | null
  totalunits: number | null
  rateperunitcash: number | null
  isactive: boolean | null
}

const formatNumber = (value: number | null | undefined) => Number(value || 0).toLocaleString()

const ProductReport = ({ data }: { data: ProductRow[] }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchText, setSearchText] = useState('')
  const router = useRouter()

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const filteredRows = useMemo(() => {
    const term = searchText.trim().toLowerCase()
    if (!term) return rows

    return rows.filter(row =>
      [row.productcode, row.productname]
        .map(value => String(value ?? '').toLowerCase())
        .some(value => value.includes(term))
    )
  }, [rows, searchText])

  const totals = useMemo(
    () =>
      filteredRows.reduce(
        (acc, row) => ({
          inStock: acc.inStock + Number(row.unitsinstock || 0),
          total: acc.total + Number(row.totalunits || 0)
        }),
        { inStock: 0, total: 0 }
      ),
    [filteredRows]
  )

  const columns: GridColDef[] = [
    { field: 'productcode', headerName: 'Product Code', flex: 0.15, minWidth: 130 },
    { field: 'productname', headerName: 'Product Name', flex: 0.25, minWidth: 180 },
    {
      field: 'unitsinstock',
      headerName: 'Units In Stock',
      flex: 0.15,
      minWidth: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => <span>{formatNumber(params.row.unitsinstock)}</span>
    },
    {
      field: 'totalunits',
      headerName: 'Total Units',
      flex: 0.15,
      minWidth: 130,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => <span>{formatNumber(params.row.totalunits)}</span>
    },
    {
      field: 'rateperunitcash',
      headerName: 'Rate Per Unit Cash',
      flex: 0.18,
      minWidth: 170,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => <span>{formatNumber(params.row.rateperunitcash)}</span>
    },
    {
      field: 'isactive',
      headerName: 'Active',
      flex: 0.1,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant='body2'
          sx={{ color: params.row.isactive ? 'success.main' : 'text.secondary', fontWeight: 600 }}
        >
          {params.row.isactive ? 'Yes' : 'No'}
        </Typography>
      )
    },
    {
      // Stock is kept by hand: correct it on the product's edit form.
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 0.1,
      minWidth: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Button size='small' variant='contained' onClick={() => router.push(`/app/products/edit?id=${params.row.id}&from=productreport`)}>
          Edit
        </Button>
      )
    }
  ]

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title='Product Inventory Report' />
        <Grid container paddingX={5} spacing={2} alignItems='center' justifyContent='space-between'>
          <Grid item>
            <Box>
              <Typography variant='body2'>
                {filteredRows.length} product{filteredRows.length === 1 ? '' : 's'}
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                Units in stock {formatNumber(totals.inStock)} · total units {formatNumber(totals.total)}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <TextField
              size='small'
              label='Search'
              placeholder='Code or name'
              value={searchText}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
            />
          </Grid>
        </Grid>

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rows={filteredRows}
          getRowId={row => row.id}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.125rem'
            }
          }}
        />
      </DatePickerWrapper>
    </Card>
  )
}

export default ProductReport
