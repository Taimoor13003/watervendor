import React, { useState, ChangeEvent, useMemo } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import Icon from 'src/@core/components/icon';
import toast from 'react-hot-toast';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

type SortType = 'asc' | 'desc' | undefined | null;

const AccountTable = ({ data }: { data: any[] }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['accountname', 'accountcode', 'accountnumber', 'balance'];
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const visibleData = useMemo(() => data.filter(row => row?.isdeleted !== true), [data]);
  const totalAccounts = visibleData.length;

  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const valueRaw = searchValue || '';
    const value = valueRaw.replace(/\s+/g, ' ').trim();
    const searchRegex = new RegExp(escapeRegExp(value), 'i');

    const filteredRows = visibleData.filter(row => {
      // full combined string for better matching
      const combined = `${row.accountname || ''} ${row.accountcode || ''} ${row.accountnumber || ''} ${row.balance ?? ''}`;
      if (combined && searchRegex.test(combined)) return true;

      return Object.keys(row).some(field => {
        if (filterFields.includes(field)) {
          return searchRegex.test(String(row[field] ?? ''));
        }
        return false;
      });
    });

    if (value.length) {
      setFilteredData(filteredRows);
    } else {
      setFilteredData([]);
    }
  };

  const handleResetFilters = () => {
    handleSearch('');
    setSearchText('');
  };

  const askDelete = (id: number) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const onDelete = async () => {
    const id = pendingId;
    if (!id) return;
    setDeletingId(id);
    setConfirmOpen(false);
    try {
      const res = await fetch(`/api/accounts-delete?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Failed to delete account');
      }
      toast.success('Account deleted');
      const source = filteredData.length ? filteredData : visibleData;
      const next = source.filter((row: any) => row.id !== id && row.accountid !== id);
      setFilteredData(next);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete account');
    } finally {
      setDeletingId(null);
      setPendingId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 290,
      field: 'accountname',
      headerName: 'Account Name',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.accountname}
          </Typography>
        </Box>
      ),
    },
    {
      flex: 0.175,
      minWidth: 110,
      field: 'accountcode',
      headerName: 'Account Code',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.accountcode}
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
            onClick={() => {
              const targetId = params.row.id;
              router.push(`/app/accounts/edit?id=${targetId}`);
            }}
            disabled={!params.row.id}
          >
            Edit
          </Button>
          <Button
            variant='contained'
            color='error'
            disabled={deletingId === params.row.id}
            onClick={() => askDelete(params.row.id)}
          >
            {deletingId === params.row.id ? 'Deleting...' : 'Delete'}
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
              <Icon icon='mdi:bank-outline' />
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                Accounts
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary'>
              Search, filter, and manage chart of accounts.
            </Typography>
            <Box display='flex' gap={1} flexWrap='wrap'>
              <Chip label={`Total accounts: ${totalAccounts}`} color='primary' variant='outlined' />
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
              onClick={() => router.push('/app/accounts/create')}
            >
              Create account
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
          rows={filteredData.length ? filteredData : visibleData}
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
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>This will soft delete the account. Continue?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={onDelete} color='error' variant='contained' disabled={deletingId !== null}>
            {deletingId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AccountTable;
