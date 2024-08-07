import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'; // Adjusted from QuickSearchToolbar
import { DataGridRowType } from 'src/@fake-db/types'; // Ensure this type is correctly defined or use any

type SortType = 'asc' | 'desc' | undefined | null;

const ProductTable = ({ products =[] }: { products?: any[] }) => {
  const [total, setTotal] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [sort, setSort] = useState<SortType>('asc');
  const [sortColumn, setSortColumn] = useState<string>('productCode');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['productCode', 'productName', 'unitsInStock'];

  function loadServerRows(currentPage: number, data: DataGridRowType[]) {
    return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize);
  }

  useEffect(() => {
    if (Array.isArray(products)) {
      setRows(loadServerRows(paginationModel.page, products));
      setTotal(products.length);
    }
  }, [products]);

  const fetchTableData = useCallback(
    async (sort: SortType, q: string, column: string) => {
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
      setSortColumn('productCode');
    }
  };
console.log(products,"pdata")
  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = products.filter(row => {
      return Object.keys(row).some(field => {
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
      field: 'productname',
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
      field: 'unitsinstock',
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
          ${params.row.rateperunitcash.toFixed(2)}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      field: 'rateperunitcoupon',
      headerName: 'Rate Per Unit (Coupen)',
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
