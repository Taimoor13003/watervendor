import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import { format } from 'date-fns'
import Image from 'next/image'

// Styled MUI components
const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
  borderBottom: 0,
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  '&:not(:last-child)': {
    paddingRight: `${theme.spacing(2)} !important`,
  },
}))

const CalcWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing(2),
  },
}))

const PreviewCard = ({ data }: { data: any[] }) => {
  const datanew = Array.isArray(data) ? data : [];
  const totalBottlesDelivered = datanew.reduce((total: number, current: any) => total + (current.orderqty || 0), 0);
  const totalBottlesReturned = datanew.reduce((total: number, current: any) => total + (current.reqbottles || 0), 0);

  if (datanew.length === 0) {
    return null;
  }

  const firstItem = datanew[0] || {};
  const firstname = firstItem?.firstname || 'N/A';
  const lastname = firstItem?.lastname || 'N/A';
  const address = firstItem?.addressres || 'N/A';

  const theme = useTheme()

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };
  const currentDate = format(new Date(), 'EEEE, dd MMMM, yyyy');

  // Calculate total amount due
  const totalAmountDue = datanew.reduce((total: number, item: any) => {
    return total + (item.orderqty || 0) * (item.rate_per_bottle || 0);
  }, 0);

  return (
    <Card>
      <CardContent sx={{ px: [6, 10] }}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
          }}
        >
          <Box>
            <Image 
              src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp'
              alt="Left" 
              width={150}
              height={80} 
            />
          </Box>
          <Typography variant="h6">Centered Text</Typography>
          <Box>
            <Image src="/images/avatars/pngwing.com.png" alt="Right"  width={150} height={80} />
          </Box>
        </Box>
        <Typography variant='h5'>
          <b>Name: </b> {`${firstname} ${lastname}`}
        </Typography>
        <Typography>
          <b>Address: </b> {address}
        </Typography>
        <Typography>
          <b>Date: </b> {currentDate}
        </Typography>
        <Typography>
          Account no.# {currentDate}
        </Typography>
        <Divider />
        <Typography variant="h1" align='center'>Invoice Summary</Typography>
        <Divider />
      </CardContent>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Date</TableCell>
              <TableCell>Bottles Delivered</TableCell>
              <TableCell>Bottles Returned</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& .MuiTableCell-root': {
                py: `${theme.spacing(2.5)} !important`,
                fontSize: theme.typography.body1.fontSize,
              },
            }}
          >
            {datanew.map((newData: any, index: number) => {
              const amount = (newData.orderqty || 0) * (newData.rate_per_bottle || 0);
              return (
                <TableRow key={index}>
                  <TableCell>{formatDate(newData.InvoiceDate)}</TableCell>
                  <TableCell>{newData.orderqty}</TableCell>
                  <TableCell>{newData.reqbottles}</TableCell>
                  <TableCell>{newData.rate_per_bottle}</TableCell>
                  <TableCell>{amount}</TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>{totalBottlesDelivered}</TableCell>
              <TableCell>{totalBottlesReturned}</TableCell>
              <TableCell />
              <TableCell>{totalAmountDue}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <CardContent sx={{ px: [6, 10] }}>
        <Typography sx={{ color: 'text.secondary' }}>
          <Typography component="span" sx={{ mr: 1.5, fontWeight: 500, color: 'inherit' }}>
            Note:
          </Typography>
          Total Amount Due is Rs:{totalAmountDue}
        </Typography>
        <Typography>
          Thank you
        </Typography>
      </CardContent>
    </Card>
  )
}

export default PreviewCard
