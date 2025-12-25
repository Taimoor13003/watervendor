import React, { useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Icon from 'src/@core/components/icon';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';
import toast from 'react-hot-toast';

type CustomerTableProps = {
  data: any[];
  loading?: boolean;
  onDeleteSuccess?: (id: number) => void;
};

const OrderTableServerSide = ({ data, loading = false, onDeleteSuccess }: CustomerTableProps) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = [
    'firstname',
    'middlename',
    'lastname',
    'customertype',
    'paymentmode',
    'telephoneoffice',
    'telephoneres',
    'accountno',
    'email'
  ];
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const router = useRouter();

  // Filtering function
  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    // Normalize multiple spaces to single and trim
    const valueRaw = searchValue || '';
    const value = valueRaw.replace(/\s+/g, ' ').trim();
    const searchRegex = new RegExp(escapeRegExp(value), 'i');
    const filteredRows = data.filter(row => {
      // Prefer matching the full name string first
      const fullName = `${row.firstname || ''} ${row.middlename || ''} ${row.lastname || ''}`.replace(/\s+/g, ' ').trim();
      if (fullName && searchRegex.test(fullName)) return true;

      // Then fallback to individual fields
      return Object.keys(row).some(field => {
        if (filterFields.includes(field)) {
          // @ts-ignore safe access for known fields
          return searchRegex.test(String(row[field] ?? ''));
        }
        return false;
      });
    });
    // Always set filteredData while typing, even if empty, so grid can show 0 results
    if (value.length) setFilteredData(filteredRows);
    else setFilteredData([]);
  };

  const handleResetFilters = () => {
    handleSearch('');
    setSearchText('');
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch(`/api/delete_customer?id=${selectedId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete customer');
      } else {
        toast.success('Customer deleted');
        if (onDeleteSuccess) onDeleteSuccess(selectedId);
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Delete customer failed', error);
    } finally {
      setOpen(false);
      setSelectedId(null);
    }
  };

   const handleDeleteClick = (id: number) => {
    setSelectedId(id)
    setOpen(true)
  }

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
              {[params.row.firstname, params.row.middlename, params.row.lastname].filter(Boolean).join(' ')}
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
          <Button variant='contained' 
          onClick={() => handleDeleteClick(params.row.id)}
          >
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
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              Customers
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Search, filter, and manage your customers in one place.
            </Typography>
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
              onClick={() => router.push('/app/customers/create')}
            >
              Create customer
            </Button>
          </Box>
        </Box>

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          slots={{ toolbar: QuickSearchToolbar }}
          loading={loading}
          onPaginationModelChange={setPaginationModel}
          rows={searchText.trim().length ? filteredData : data}
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

      <DialougeComponent open={open} setOpen={setOpen} onDelete={handleConfirmDelete} />
    </Card>
  );
};

export default OrderTableServerSide;
