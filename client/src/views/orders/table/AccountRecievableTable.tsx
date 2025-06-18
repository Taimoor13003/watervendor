import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import CircularProgress from '@mui/material/CircularProgress';

interface AccountRecievableTableProps {
  month: string;
  year: string;
}

const AccountRecievableTable: React.FC<AccountRecievableTableProps> = ({ month, year }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccountsReceivable = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/accountsreceivable?month=${month}&year=${year}`);
        const { result } = await res.json();
        const dataWithId = result.map((item: any, index: number) => ({
          id: index + 1,
          ...item,
        }));
        setRows(dataWithId);
        setFilteredRows(dataWithId);
      } catch (err) {
        console.error('Error fetching accounts receivable:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsReceivable();
  }, [month, year]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const lowerValue = value.toLowerCase();
    const filtered = rows.filter((row) =>
      Object.values(row).some((field) =>
        String(field).toLowerCase().includes(lowerValue)
      )
    );
    setFilteredRows(value.length ? filtered : rows);
  };

  const columns: GridColDef[] = [
    {
      flex: 0.25,
      minWidth: 200,
      field: 'firstname',
      headerName: 'Customer Name',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.firstname} {params.row.lastname}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'orderno',
      headerName: 'Order No',
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'orderdate',
      headerName: 'Order Date',
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'invoiceno',
      headerName: 'Invoice No',
    },
    {
      flex: 0.2,
      minWidth: 120,
      field: 'invoicedate',
      headerName: 'Invoice Date',
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'orderamount',
      headerName: 'Order Amount',
    },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title={`Account Receivable Report for ${month} ${year}`} />
        <Grid container paddingX={5} display="flex" justifyContent={'space-between'}>
          <Box></Box>
        </Grid>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            autoHeight
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[7, 10, 25, 50]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            slots={{ toolbar: QuickSearchToolbar }}
            sx={{ '& .MuiSvgIcon-root': { fontSize: '1.125rem' } }}
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
        )}
      </DatePickerWrapper>
    </Card>
  );
};

export default AccountRecievableTable;
