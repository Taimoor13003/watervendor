// ** React Imports
import { useEffect, useState, useCallback, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridSortModel, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import Fab from '@mui/material/Fab'

// ** Icon Imports
import Icon from 'src/@core/components/icon'


// ** ThirdParty Components
import axios from 'axios'

// ** Custom Components
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'

// ** Types Imports
import { DataGridRowType } from 'src/@fake-db/types'
import DatePicker from 'react-datepicker'
import CustomInput from './DatePicker/CustomInput'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/router';

import CustomAvatar from 'src/@core/components/mui/avatar'
import DialougeComponent from './DialougeComponent'

// ** Types Imports
import { ThemeColor } from 'src/@core/layouts/types'

type SortType = 'asc' | 'desc' | undefined | null

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import Button from '@mui/material/Button'
import Edit from 'src/views/apps/invoice/edit/Edit'

// ** renders client column

const renderClient = (params: GridRenderCellParams) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]

  if (row.avatar.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={color as ThemeColor}
        sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      >
        {getInitials(row.full_name ? row.full_name : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const OrderTableServerSide = () => {
  // ** States
  const [total, setTotal] = useState<number>(0)
  const [sort, setSort] = useState<SortType>('asc')
  const [rows, setRows] = useState<DataGridRowType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('full_name')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [open, setOpen] = useState<boolean>(false)
  const [date, setDate] = useState<DateType>(new Date())
  const router = useRouter()

  function loadServerRows(currentPage: number, data: DataGridRowType[]) {
    return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize)
  }

  const fetchTableData = useCallback(
    async (sort: SortType, q: string, column: string) => {
      await axios
        .get('/api/table/data', {
          params: {
            q,
            sort,
            column
          }
        })
        .then(res => {
          setTotal(res.data.total)
          setRows(loadServerRows(paginationModel.page, res.data.data))
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginationModel]
  )

  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn)
  }, [fetchTableData, searchValue, sort, sortColumn])

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
      fetchTableData(newModel[0].sort, searchValue, newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('full_name')
    }
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
    fetchTableData(sort, value, sortColumn)
  }

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'full_name',
      headerName: 'Order Number',
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.full_name}
              </Typography>
              <Typography noWrap variant='caption'>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'salary',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.salary}
        </Typography>
      )
    }
    ,
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Date',
      field: 'start_date',
      valueGetter: params => new Date(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.start_date}
        </Typography>
      )
    }

    , {
      flex: 0.25,
      minWidth: 290,
      field: 'Actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params

        return (
          <><Button variant='contained' onClick={() => router.push('/app/products/create')}>Edit</Button>
            <Button variant='contained' onClick={() => setOpen(true)}>Delete</Button>
          </>

        )
      }
    }
  ]

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title='Products Table' />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box display='flex' gap={2}>
            <DatePicker
              selected={date}
              id='basic-input'
              popperPlacement={'bottom-start'}
              onChange={(date: Date) => setDate(date)}
              placeholderText='Click to select a date'
              customInput={<CustomInput label='From' />}
            />
            <DatePicker
              selected={date}
              id='basic-input'
              popperPlacement={'bottom-start'}
              onChange={(date: Date) => setDate(date)}
              placeholderText='Click to select a date'
              customInput={<CustomInput label='To' />}
            />

          </Box>
          <Box>
            <Fab color='primary' variant='extended' onClick={() => router.push('/app/products/create')}>
              <Icon icon='tabler:plus' />
              Create New
            </Fab>
          </Box>
        </Grid>
        <Button variant='contained'>Go</Button>

        <DataGrid
          autoHeight
          pagination
          rows={rows}
          rowCount={total}
          columns={columns || []}
          checkboxSelection
          sortingMode='server'
          paginationMode='server'
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          onSortModelChange={handleSortModel}
          slots={{ toolbar: ServerSideToolbar }}
          onPaginationModelChange={setPaginationModel}
          slotProps={{
            baseButton: {
              size: 'medium',
              variant: 'tonal'
            },
            toolbar: {
              value: searchValue,
              clearSearch: () => handleSearch(''),
              onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
            }
          }}
        />
      </DatePickerWrapper>


      <DialougeComponent open={open} setOpen={setOpen} />

    </Card>
  )
}

export default OrderTableServerSide