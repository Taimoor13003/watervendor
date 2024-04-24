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
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import CustomInput from './DatePicker/CustomInput'
import PickersBasic from 'src/views/forms/form-elements/pickers/PickersBasic'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/router';
type SortType = 'asc' | 'desc' | undefined | null

const columns: GridColDef[] = [
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
  },
  {
    flex: 0.175,
    minWidth: 110,
    field: 'salary',
    headerName: 'Salary',
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.salary}
      </Typography>
    )
  },
  {
    flex: 0.125,
    field: 'age',
    minWidth: 80,
    headerName: 'Age',
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.age}
      </Typography>
    )
  },
]

const orderTableServerSide = () => {
  // ** States
  const [total, setTotal] = useState<number>(0)
  const [sort, setSort] = useState<SortType>('asc')
  const [rows, setRows] = useState<DataGridRowType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('full_name')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
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

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title='Server Side' />

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
            <Fab color='primary' variant='extended' onClick={() => router.push('/app/orders/create')}>
              <Icon icon='tabler:plus' />
              Create New Order
            </Fab>
          </Box>
        </Grid>


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
    </Card>
  )
}

export default orderTableServerSide
