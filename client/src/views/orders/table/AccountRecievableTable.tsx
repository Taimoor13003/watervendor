import React, { useEffect, useState, ChangeEvent } from 'react'
import { Alert, Card, CardHeader, Typography, Box, Grid } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'
import CircularProgress from '@mui/material/CircularProgress'
import { firebaseAuth } from 'src/services/firebase.service'

interface AccountRecievableTableProps {
  month: string
  year: string
}

const AccountRecievableTable: React.FC<AccountRecievableTableProps> = ({ month, year }) => {
  const [rows, setRows] = useState<any[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAccountsReceivable = async () => {
      setLoading(true)
      setError('')
      setRows([])
      setFilteredRows([])
      try {
        const idToken = await firebaseAuth.currentUser?.getIdToken()
        const res = await fetch(`/api/accountsreceivable?month=${month}&year=${year}`, {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body.error || 'Unable to load accounts receivable')

        const result = Array.isArray(body.result) ? body.result : []
        const dataWithId = result.map((item: any, index: number) => ({
          id: index + 1,
          ...item
        }))
        setRows(dataWithId)
        setFilteredRows(dataWithId)
      } catch (err) {
        console.error('Error fetching accounts receivable:', err)
        setError(err instanceof Error ? err.message : 'Unable to load accounts receivable')
      } finally {
        setLoading(false)
      }
    }

    fetchAccountsReceivable()
  }, [month, year])

  const handleSearch = (value: string) => {
    setSearchText(value)
    const lowerValue = value.toLowerCase()
    const filtered = rows.filter(row =>
      Object.values(row).some(field => String(field).toLowerCase().includes(lowerValue))
    )
    setFilteredRows(value.length ? filtered : rows)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 200,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.firstname} {params.row.lastname}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'accountno',
      headerName: 'Account No.'
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'ordercount',
      headerName: 'Unpaid Orders',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2'>{params.row.ordercount || 0}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'firstinvoicedate',
      headerName: 'First Invoice Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2'>
          {params.row.firstinvoicedate ? new Date(params.row.firstinvoicedate).toLocaleDateString() : '-'}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'balance',
      headerName: 'Unpaid Amount',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ fontWeight: 700 }}>
          {Number(params.row.balance || 0).toFixed(2)}
        </Typography>
      )
    }
  ]

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title={`Unpaid Orders for ${month} ${year}`} />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box></Box>
        </Grid>

        {loading ? (
          <Box display='flex' justifyContent='center' my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box mx={5} mb={3}>
            <Alert severity='error'>{error}</Alert>
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[7, 10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{ toolbar: QuickSearchToolbar }}
            localeText={{ noRowsLabel: 'No unpaid, non-cancelled orders were found for this month.' }}
            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.125rem' } }}
            slotProps={{
              baseButton: {
                size: 'medium',
                variant: 'outlined'
              },
              toolbar: {
                value: searchText,
                clearSearch: () => handleSearch(''),
                onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
              }
            }}
          />
        )}
      </DatePickerWrapper>
    </Card>
  )
}

export default AccountRecievableTable
