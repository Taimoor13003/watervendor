import React, { useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';

const GeneralJournalReport = ({ data }: { data: any[] }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const filterFields = ['voucherNumber', 'voucherDate', 'accountCode', 'invoiceChq', 'debitAmount', 'creditAmount'];
  
  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(searchValue, 'i');
    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => filterFields.includes(field) && searchRegex.test(row[field]));
    });
    setFilteredData(searchValue.length ? filteredRows : []);
  };
console.log(data,'data coming from api component ')
  const columns: GridColDef[] = [
    { field: 'productcode', headerName: 'Product Code', flex: 0.15, minWidth: 120 },
    { field: 'unitsinstock', headerName: 'Units In Stock', flex: 0.15, minWidth: 120 },
    { field: 'totalunits', headerName: 'Total Units', flex: 0.15, minWidth: 150 },
    { field: 'rateperunitcash', headerName: 'Rate Per Unit Cash', flex: 0.2, minWidth: 180 },
    { field: 'rateperunitcoupon', headerName: 'Rate Per Unit Coupon', flex: 0.15, minWidth: 120, type: 'number' },
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title="Product Inventory Report" />
        

        <DataGrid
          autoHeight
          columns={columns}
          pageSizeOptions={[7, 10, 25, 50]}
          paginationModel={paginationModel}
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

    
    </Card>
  );
};

export default GeneralJournalReport;
