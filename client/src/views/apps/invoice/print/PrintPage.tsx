import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import axios from 'axios';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Image from 'next/image';

// Styled components
const CalcWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing(2),
  },
}));

const MUITableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  paddingTop: `${theme.spacing(1)} !important`,
  paddingBottom: `${theme.spacing(1)} !important`,
}));

const InvoicePrint = () => {
  const [error, setError] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<any>([]);
  const theme = useTheme();
  const router = useRouter();
  const { query } = router;
  const id = query.customerid;
  const date1 = query.startdate;
  const date2 = query.enddate;

  // Calculate totals
  const totalBottlesDelivered = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.orderqty || 0), 0);
  const totalBottlesReturned = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.reqbottles || 0), 0);
  const totalAmountDue = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.orderqty || 0) * (item.rate_per_bottle || 0), 0);

  // Extract first item details
  const firstItem = Object.values(invoiceData).flat()[0] || {};
  const firstname = firstItem?.firstname || 'N/A';
  const lastname = firstItem?.lastname || 'N/A';
  const address = firstItem?.addressres || 'N/A';

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy');
  };

  // Fetch invoice data
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/invoice', {
        params: {
          customerids: id,
          startDate: date1,
          endDate: date2,
        },
      });
      setInvoiceData(response.data); // Ensure this is an array
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(true);
    }
  };

  useEffect(() => {
    if (id && date1 && date2) {
      fetchData();

    }
  }, [id, date1, date2]);

  console.log(invoiceData, "invoiceData")

  useEffect(() => {

    if (id && typeof id === "string" && invoiceData[id]) {
      window.print()
    }
  }, [invoiceData])

  return (
    <>
      <Box sx={{ p: 12, pb: 6 }}>
        <Grid container>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '20px',
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Image
                  src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp'
                  alt="Left"
                  width={250}
                  height={110}
                />
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Image
                  src='/images/avatars/WhatsApp Image 2024-09-04 at 01.17.42_00181990.jpg'
                  alt="Left"
                  width={350}
                  height={150}
                />
              </Box>
              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Image
                  src="/images/avatars/pngwing.com.png"
                  alt="Right"
                  width={250}
                  height={110}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { sm: 'flex-end', xs: 'flex-start' } }}>
              <Typography variant='h4' sx={{ mb: 2 }}>
                {/* {`Invoice #${invoice.id}`} */}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid>
          <Typography variant='h5'>
            <b>Name: </b> {`${firstname} ${lastname}`}
          </Typography>
          <Typography>
            <b>Address: </b> {address}
          </Typography>
          <Typography>
            <b>Start Date: </b> {formatDate(date1)}
          </Typography>
          <Typography>
            <b>End Date: </b> {formatDate(date2)}
          </Typography>
          <Typography>
            <b>Account no.# </b> {id}
          </Typography>
          <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />
          <Typography variant='h1' align='center'>Invoice Details</Typography>
        </Grid>
        <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

        <Table>
          <TableHead>
            <TableRow>
              <MUITableCell>Invoice Date</MUITableCell>
              <MUITableCell align='right'>Bottles Delivered</MUITableCell>
              <MUITableCell align='right'>Bottles Returned</MUITableCell>
              <MUITableCell align='right'>Rate</MUITableCell>
              <MUITableCell align='right'>Total</MUITableCell>
              <Divider />
            </TableRow>

          </TableHead>
          <TableBody>
            {Object.keys(invoiceData).map((invoiceKey) => {
              return invoiceData[invoiceKey].map((item: any, index: number) => (
                <TableRow key={index}>
                  <MUITableCell>{formatDate(item?.InvoiceDate)}</MUITableCell>
                  <MUITableCell align='right'>{item?.orderqty}</MUITableCell>
                  <MUITableCell align='right'>{item?.reqbottles}</MUITableCell>
                  <MUITableCell align='right'>{item?.rate_per_bottle}</MUITableCell>
                  <MUITableCell align='right'>{(item?.rate_per_bottle * item?.orderqty).toFixed(2)}</MUITableCell>
                </TableRow>
              ));
            })}
            <TableRow>
              <MUITableCell sx={{ fontWeight: 'bold' }}>Total</MUITableCell>
              <MUITableCell align='right'>{totalBottlesDelivered}</MUITableCell>
              <MUITableCell align='right'>{totalBottlesReturned}</MUITableCell>
              <MUITableCell align='right'></MUITableCell>
              <MUITableCell align='right'>{totalAmountDue.toFixed(2)}</MUITableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

        <Box sx={{ mt: 4 }}>
          <CalcWrapper>
            <Typography>Total Bottles Delivered:</Typography>
            <Typography sx={{ fontWeight: 600 }}>{totalBottlesDelivered}</Typography>
          </CalcWrapper>
          <CalcWrapper>
            <Typography>Total Bottles Returned:</Typography>
            <Typography sx={{ fontWeight: 600 }}>{totalBottlesReturned}</Typography>
          </CalcWrapper>
          <CalcWrapper>
            <Typography>Total Amount Due:</Typography>
            <Typography sx={{ fontWeight: 600 }}>${totalAmountDue.toFixed(2)}</Typography>
          </CalcWrapper>
          <Divider sx={{ my: theme => `${theme.spacing(6)} !important` }} />

        </Box>
      </Box>
    </>
  );
};

export default InvoicePrint;
