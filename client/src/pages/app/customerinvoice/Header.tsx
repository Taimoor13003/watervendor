import Link from 'next/link';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { GridRowId } from '@mui/x-data-grid';
import MenuItem from '@mui/material/MenuItem';

import CustomTextField from 'src/@core/components/mui/text-field';

interface TableHeaderProps {
  value: string;
  selectedRows: GridRowId[];
  handleFilter: (val: string) => void;
  selectedRowIds: any[]; // Assuming this is an array of selected row IDs or customer IDs
  startDate: Date | null;
  endDate: Date | null;
  isDataReady: boolean; // New prop to determine if data is ready
}

const TableHeader = (props: TableHeaderProps) => {
  const { value, selectedRows, handleFilter, selectedRowIds, startDate, endDate, isDataReady } = props;

  return (
    <Box
      sx={{
        p: 5,
        pb: 3,
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
     

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <Button
          sx={{ mb: 2 }}
          component={Link}
          variant='contained'
          href={`/app/customerinvoice/add2?customerid=${selectedRowIds.join(',')}&startDate=${startDate ? startDate.toISOString() : ''}&endDate=${endDate ? endDate.toISOString() : ''}`}
          disabled={!isDataReady} 
        >
          Create Invoice
        </Button>
      </Box>
    </Box>
  );
};

export default TableHeader;
