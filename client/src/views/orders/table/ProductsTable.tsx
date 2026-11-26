import React, { useMemo, useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import Icon from 'src/@core/components/icon';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import toast from 'react-hot-toast';
import { authFetch } from 'src/lib/api-client';

const ProductTable = ({ products: initialProducts = [] }: { products?: any[] }) => {
  // Rows leave the list as soon as they are deleted, without a page reload.
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const router = useRouter();

  const filterFields = ['productcode', 'productname', 'unitsinstock'];

  const totalProducts = products.length;
  const totalStock = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.unitsinstock) || 0), 0),
    [products]
  );

  const formatRate = (val: number | null | undefined) => {
    if (val === null || val === undefined || Number.isNaN(val)) return '—';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = products.filter((row) => {
      return Object.keys(row).some((field) => {
        if (filterFields.includes(field)) {
          return searchRegex.test(String(row[field] ?? ''));
        }
        return false;
      });
    });

    if (searchValue.length) {
      setFilteredData(filteredRows);
    } else {
      setFilteredData([]);
    }
  };

  const handleResetFilters = () => {
    handleSearch('');
    setSearchText('');
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/products-delete?id=${toDelete.id}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message || 'Failed to delete product');

      setProducts(current => current.filter(row => row.id !== toDelete.id));
      setFilteredData(current => current.filter(row => row.id !== toDelete.id));
      toast.success('Product deleted');
      setToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'productcode',
      headerName: 'Product Code',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 700 }}>
            {params.row.productcode}
          </Typography>
          <Typography noWrap variant='caption' sx={{ color: 'text.secondary' }}>
            ID: {params.row.productid ?? params.row.id ?? '—'}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.25,
      minWidth: 220,
      field: 'productname',
      headerName: 'Product Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.productname}
        </Typography>
      ),
    },
    {
      flex: 0.16,
      minWidth: 140,
      field: 'unitsinstock',
      headerName: 'Units in Stock',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.unitsinstock ?? 0}
          color={(params.row.unitsinstock ?? 0) > 0 ? 'success' : 'default'}
          size='small'
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      flex: 0.14,
      minWidth: 120,
      field: 'totalunits',
      headerName: 'Total Units',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.totalunits ?? 0}
        </Typography>
      ),
    },
    {
      flex: 0.175,
      minWidth: 120,
      field: 'rateperunitcash',
      headerName: 'Rate Per Unit (Cash)',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {formatRate(params.row.rateperunitcash)}
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
          <Button
            variant='contained'
            onClick={() => router.push(`/app/products/edit?id=${params.row.id}`)}
            disabled={!params.row.id}
          >
            Edit
          </Button>
          <Button variant='contained' color='error' onClick={() => setToDelete(params.row)} disabled={!params.row.id}>
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <Box
          sx={{
            px: 5,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: theme =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(90deg, rgba(240,248,255,0.65), rgba(225,245,254,0.9))'
                : 'rgba(255,255,255,0.03)'
          }}
        >
          <Box display='flex' flexDirection='column' gap={1}>
            <Box display='flex' alignItems='center' gap={1}>
              <Icon icon='mdi:cube-outline' />
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Products
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary'>
              Search, filter, and manage products.
            </Typography>
            <Box display='flex' gap={1} flexWrap='wrap'>
              <Chip label={`Total products: ${totalProducts}`} color='primary' variant='outlined' />
              <Chip label={`Units in stock: ${totalStock}`} color='success' variant='outlined' />
            </Box>
          </Box>
          <Box display='flex' gap={2} flexWrap='wrap'>
            <Button
              variant='outlined'
              startIcon={<Icon icon='mdi:filter-variant' />}
              onClick={handleResetFilters}
            >
              Reset filters
            </Button>
            <Button
              variant='contained'
              startIcon={<Icon icon='mdi:plus' />}
              onClick={() => router.push('/app/products/create')}
            >
              Add product
            </Button>
          </Box>
        </Box>

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
      </DatePickerWrapper>

      <Dialog open={Boolean(toDelete)} onClose={() => (deleting ? null : setToDelete(null))}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography>
            {toDelete?.productname || 'This product'} ({toDelete?.productcode || 'no code'}) will be removed from the
            products list and Inventory in Hand.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductTable;
