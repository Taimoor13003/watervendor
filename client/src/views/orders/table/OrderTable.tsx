import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';
import moment from 'moment';

type SortType = 'asc' | 'desc' | undefined | null;

const OrderTableServerSide = ({ data }: { data: DataGridRowType[] }) => {
  const [total, setTotal] = useState<number>(0);
  const [rows, setRows] = useState<DataGridRowType[]>([]);
  const [sort, setSort] = useState<SortType>('asc');
  const [sortColumn, setSortColumn] = useState<string>('firstname');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['firstname', 'lastname', 'customertype', 'paymentmode', 'telephoneoffice', 'telephoneres'];

  function loadServerRows(currentPage: number, data: DataGridRowType[]) {
    return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize);
  }
console.log(data,"dataorderdatabase")
  useEffect(() => {
    // Ensure each row has a unique `id` property
    const updatedRows = data.map(row => ({
      ...row,
      id: row.orderid, // Use `orderid` as the unique `id`
    }));
    setRows(loadServerRows(paginationModel.page, updatedRows));
    setTotal(updatedRows.length); // Assuming total count is the length of the updated rows initially
  }, [data, paginationModel.page]);

  const fetchTableData = useCallback(
    async (sort: SortType, q: string, column: string) => {
      // You might not need this function if you're fetching data server-side
      // This function is typically used for server-side fetching
      console.log(sort, q, column);
    },
    []
  );

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort);
      setSortColumn(newModel[0].field);
      fetchTableData(newModel[0].sort, searchValue, newModel[0].field);
    } else {
      setSort('asc');
      setSortColumn('firstname');
    }
  };

  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        if (filterFields.includes(field)) {
          // @ts-ignore
          return searchRegex.test(row[field]);
        }
      });
    });
    if (searchValue.length) {
      setFilteredData(filteredRows);
    } else {
      setFilteredData([]);
    }
  };

  const onDelete = () => {
    alert("Delete Function");
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'orderno',
      headerName: 'Order Number',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {params.row.orderno}
            </Typography>
            <Typography noWrap variant='caption'>
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.firstname} {params.row.lastname}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      type: 'date',
      minWidth: 120,
      headerName: 'Order Date',
      field: 'orderdate',
      valueGetter: params => new Date(params.value),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {moment(params.row.orderdate).format('DD-MM-YYYY')}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={3}>
          <Button variant='contained' onClick={() => router.push(`/app/orders/edit?orderid=${params.row.orderid}`)}>
            Edit
          </Button>
          <Button variant='contained' onClick={() => setOpen(true)}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title='Order Table' />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box></Box>
          <Box>
            <Fab color='primary' variant='extended' onClick={() => router.push('/app/orders/create')}>
              Create New Order
            </Fab>
          </Box>
        </Grid>

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          slots={{ toolbar: QuickSearchToolbar }}
          onPaginationModelChange={setPaginationModel}
          rows={filteredData.length ? filteredData : rows}
          getRowId={(row) => row.orderid} // Use `orderid` as the unique `id`
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: '1.125rem',
            },
          }}
          slotProps={{
            baseButton: {
              size: 'medium',
              variant: 'outlined',
            },
            toolbar: {
              value: searchText,
              clearSearch: () => handleSearch(''),
              onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value),
            },
          }}
        />
      </DatePickerWrapper>

      <DialougeComponent open={open} setOpen={setOpen} onDelete={onDelete} />
    </Card>
  );
};

export default OrderTableServerSide;
