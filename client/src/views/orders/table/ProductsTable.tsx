import React, { useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types'; // Ensure this type is correctly defined or use `any`

const ProductTable = ({ products = [] }: { products?: any[] }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>(''); // Corrected unused `searchValue`
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();

  const filterFields = ['productCode', 'productName', 'unitsInStock'];


  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = products.filter((row) => {
      return Object.keys(row).some((field) => {
        if (filterFields.includes(field)) {
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
      field: 'productcode',
      headerName: 'Product Code',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.productcode}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'productName',
      headerName: 'Product Name',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.productname}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'unitsinstockk',
      headerName: 'Units in Stock',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.unitsinstock}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      field: 'rateperunitcash',
      headerName: 'Rate Per Unit (Cash)',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          ${params.row. rateperunitcash.toFixed(2)}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      field: 'rateperunitcoupon',
      headerName: 'Rate Per Unit (Coupon)',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          ${params.row.rateperunitcoupon.toFixed(2)}
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
          <Button variant='contained' onClick={() => router.push(`/app/products/edit?productid=${params.row.id}`)}>
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
      <CardHeader title='Product Table' />
      <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
        <Box></Box>
        <Box>
          <Fab color='primary' variant='extended' onClick={() => router.push('/app/products/create')}>
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
        rows={filteredData.length ? filteredData : products}
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

      <DialougeComponent open={open} setOpen={setOpen} onDelete={onDelete} />
    </Card>
  );
};

export default ProductTable;
