import React, { useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';

interface GeneralJournalReportProps {
  data: {
    voucherno: string;
    voucherdate: string;
    accountcode: string;
    chqno: string | null;
    debitamount: number;
    creditamount: number;
  }[];
}

const GeneralJournalReport: React.FC<GeneralJournalReportProps> = ({ data }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState(data);

  const filterFields = ['voucherno', 'accountcode', 'chqno'];

  const escapeRegExp = (value: string) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        if (filterFields.includes(field)) {

          //@ts-ignore
          return searchRegex.test(row[field]);
        }
        return false;
      });
    });
    setFilteredData(searchValue.length ? filteredRows : data);
  };

  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'voucherno',
      headerName: 'Voucher #',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.voucherno}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'voucherdate',
      headerName: 'Voucher Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {new Date(params.row.voucherdate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'accountcode',
      headerName: 'Account Code',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: "none" }}>
            {params.row.transactions.map((transaction: any, index: number) => (
              <li key={index}>{transaction.accountcode}</li>
            ))}
          </ul>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'chqno',
      headerName: 'Invoice / Chq',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {params.row.chqno || 'N/A'}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'debitamount',
      headerName: 'Debit Amount',
      renderCell: (params: GridRenderCellParams) => {
        const obj = params.row.transactions.find((transaction: any) => transaction.debitamount > 0) || {}
        return (
          <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: "none" }}>
            <li>{obj?.debitamount || 0}</li>
            <li>{obj?.creditamount || 0}</li>
          </ul>
        );
      },
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'creditamount',
      headerName: 'Credit Amount',
      renderCell: (params: GridRenderCellParams) => {
        const obj = params.row.transactions.find((transaction: any) => transaction.creditamount > 0) || {}
        return (
          <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: "none" }}>
            <li>{obj?.debitamount || 0}</li>
            <li>{obj?.creditamount || 0}</li>
          </ul>
        );
      },
    },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title="General Journal Report" />
        <Grid container paddingX={5} display="flex" justifyContent="space-between">
          <Box>General Journal Report Summary</Box>
        </Grid>

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rows={data}
          getRowId={(row) => row.voucherno}
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
    </Card>
  );
};

export default GeneralJournalReport;
