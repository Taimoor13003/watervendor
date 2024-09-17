import React, { useEffect, useState, ChangeEvent, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import DialougeComponent from './DialougeComponent';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';
import Typography from '@mui/material/Typography'; // Import Typography

type SortType = 'asc' | 'desc' | undefined | null;

const AccountTable = ({ data }: { data: any[] }) => {
  const [total, setTotal] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [sort] = useState<SortType>('asc');
  const [sortColumn] = useState<string>('accountname');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['accountname', 'accountnumber', 'balance'];

  console.log(total, rows, sort, sortColumn);

  const loadServerRows = useCallback(
    (currentPage: number, data: DataGridRowType[]) => {
      return data.slice(currentPage * paginationModel.pageSize, (currentPage + 1) * paginationModel.pageSize);
    },
    [paginationModel.pageSize] // Only recalculate when pageSize changes
  );

  useEffect(() => {
    setRows(loadServerRows(paginationModel.page, data));
    setTotal(data.length);
  }, [data, loadServerRows, paginationModel.page]);

  console.log(data, 'acc data');

  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = data.filter(row => {
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
          <Button variant='contained' onClick={() => router.push(`/app/accounts/edit?accountid=${params.row.accountid}`)}>
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
      <CardHeader title='Account Table' />
      <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
        <Box></Box>
        <Box>
          <Fab color='primary' variant='extended' onClick={() => router.push('/app/accounts/create')}>
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

      <DialougeComponent open={open} setOpen={setOpen} onDelete={onDelete} />
    </Card>
  );
};

export default AccountTable;
