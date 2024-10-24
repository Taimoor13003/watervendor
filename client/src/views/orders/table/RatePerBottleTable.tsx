import React, { useEffect, useState, ChangeEvent } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar';
import { DataGridRowType } from 'src/@fake-db/types';


const RatePerBottle = ({ data, ratePerBottle }: { data: any[], ratePerBottle: number }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataGridRowType[]>([]);
  const filterFields = ['firstname', 'lastname', 'customertype', 'paymentmode', 'telephoneoffice', 'telephoneres'];
console.log(ratePerBottle,"rd")
  useEffect(() => {
    const filtered = data.filter(row => row.rate_per_bottle === ratePerBottle);
    setFilteredData(filtered);
  }, [data, ratePerBottle]);

  const escapeRegExp = (value: string) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = filteredData.filter(row => {
      return Object.keys(row).some(field => {
        if (filterFields.includes(field)) {


//@ts-ignore

          return searchRegex.test(row[field]);
        }
      });
    });
    setFilteredData(searchValue.length ? filteredRows : data);
  };

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
              {params.row.firstname + " " + params.row.middlename + " " + params.row.lastname}
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
    }
  ];

  return (
    <Card>
      <DatePickerWrapper>
        <CardHeader title={`Customer Detail (by Rate)`} />
        <Grid container paddingX={5} display='flex' justifyContent={'space-between'}>
          <Box>
            Customer report for 'rate Rs {ratePerBottle.toFixed(2)} PER Bottle'
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
      </DatePickerWrapper>
    </Card>
  );
};

export default RatePerBottle;
