import React, { useEffect, useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';

interface CustomerOutstandingReportProps {
  data: {
    orderno: string;
    orderdate: string;
    deliveredbyempid: number;
    deliverydate: string;
    invoiceno: number;
    invoicedate: string;
    customerid: number;
    firstname: string;
    lastname: string;
    quantity: number;
    bottlereturndate: string | null;
  }[];
}

const CustomerOutstandingReport: React.FC<CustomerOutstandingReportProps> = ({ data }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState(data);

  const filterFields = ['orderno', 'firstname', 'lastname', 'invoiceno'];

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
      field: 'orderno',
      headerName: 'Order No',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {params.row.orderno}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'orderdate',
      headerName: 'Order Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {new Date(params.row.orderdate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'deliveredbyempid',
      headerName: 'Delivered By (Emp ID)',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {params.row.deliveredbyempid}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'deliverydate',
      headerName: 'Delivery Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {new Date(params.row.deliverydate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'invoiceno',
      headerName: 'Invoice No',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {params.row.invoiceno}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'invoicedate',
      headerName: 'Invoice Date',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {new Date(params.row.invoicedate).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'quantity',
      headerName: 'Bottles Ordered',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {params.row.quantity}
        </Typography>
      ),
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'returnqty',
      headerName: 'Bottles Returned',
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {params.row.returnqty}
        </Typography>
      ),
    },
  ];
  

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title="Customer Outstanding Report" />
        <Grid container paddingX={5} display="flex" justifyContent="space-between">
          <Box>Customer Outstanding Report Summary</Box>
        </Grid>
        
        <DataGrid
  autoHeight
  columns={columns}
  pageSizeOptions={[7, 10, 25, 50]}
  paginationModel={paginationModel}

  // slots={{ toolbar: QuickSearchToolbar }}
  
  onPaginationModelChange={setPaginationModel}
  rows={filteredData.length ? filteredData : data}
  getRowId={(row) => row.orderno} // Use `orderno` as the unique identifier
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

export default CustomerOutstandingReport;
