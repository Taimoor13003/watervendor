import React, { useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';

const OrderTableServerSide = ({ data }: { data: any[] }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['firstname', 'lastname', 'customertype', 'paymentmode', 'telephoneoffice', 'telephoneres'];
  const [open, setOpen] = useState(false)

  const router = useRouter();

  // Filtering function
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
    alert('Delete Function');
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
              {params.row.firstname + ' ' + params.row.middlename + ' ' + params.row.lastname}
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
      field: 'customertype',
      headerName: 'Customer Type',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.customertype}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'Payment Mode',
      field: 'paymentmode',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.paymentmode}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'Telephone (Delivery)',
      field: 'telephoneres',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.telephoneres}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      headerName: 'Telephone (Office)',
      field: 'telephoneoffice',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.telephoneoffice}
        </Typography>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params: GridRenderCellParams) => (
        <Box display='flex' gap={3}>
          <Button variant='contained' onClick={() => router.push(`/app/customers/edit?customerid=${params.row.customerid}`)}>
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
        <CardHeader title='Customer Table' />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box />
          <Box>
            <Fab color='primary' variant='extended' onClick={() => router.push('/app/customers/create')}>
              Create New
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
          rows={filteredData.length ? filteredData : data}
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
