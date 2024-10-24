import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import axios from 'axios';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import Image from 'next/image';


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
  const router = useRouter();
  const { query } = router;
  const id = query.customerid;
  const date1 = query.startdate;
  const date2 = query.enddate;
  console.log(error)

  const totalBottlesDelivered = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.orderqty || 0), 0);
  const totalBottlesReturned = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.reqbottles || 0), 0);
  const totalAmountDue = Object.values(invoiceData).flat().reduce((total: number, item: any) => total + (item.orderqty || 0) * (item.rate_per_bottle || 0), 0);

  const firstItem = Object.values(invoiceData).flat()[0] || {};

  //@ts-ignore

  const firstname = firstItem?.firstname || 'N/A';

  //@ts-ignore

  const lastname = firstItem?.lastname || 'N/A';
  
  //@ts-ignore

  const address = firstItem?.addressres || 'N/A';

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    return format(date, 'dd/MM/yyyy');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/invoice', {
          params: {
            customerids: id,
            startDate: date1,
            endDate: date2,
          },
        });
        setInvoiceData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(true);
      }
    };

    if (id && date1 && date2) {
      fetchData();
    }
  }, [id, date1, date2]);

  useEffect(() => {
    if (id && typeof id === "string" && invoiceData[id]) {
      window.print();
    }
  }, [id, invoiceData]);

  return (
    <Box sx={{ p: 12, pb: 6 }}>
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '20px', boxSizing: 'border-box' }}>
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              <Image src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp' alt="Left" width={240} height={100} />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Image src='/images/avatars/WhatsApp Image 2024-09-04 at 01.17.42_00181990.jpg' alt="Center" width={400} height={200} />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Image src="/images/avatars/pngwing.com.png" alt="Right" width={240} height={100} />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { sm: 'flex-end', xs: 'flex-start' } }}>
            <Typography variant='h4' sx={{ mb: 2 }}>
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
          {Object.keys(invoiceData).map((invoiceKey) => (
            invoiceData[invoiceKey].map((item: any, index: number) => (
              <TableRow key={index}>
                <MUITableCell>{formatDate(item?.InvoiceDate)}</MUITableCell>
                <MUITableCell align='right'>{item?.orderqty}</MUITableCell>
                <MUITableCell align='right'>{item?.reqbottles}</MUITableCell>
                <MUITableCell align='right'>{item?.rate_per_bottle}</MUITableCell>
                <MUITableCell align='right'>{(item?.rate_per_bottle * item?.orderqty).toFixed(2)}</MUITableCell>
              </TableRow>
            ))
          ))}
          <TableRow>
            <MUITableCell sx={{ fontWeight: 'bold' }}>Total</MUITableCell>
            <MUITableCell align='right'>{totalBottlesDelivered}</MUITableCell>
            <MUITableCell align='right'>{totalBottlesReturned}</MUITableCell>
            <MUITableCell />
            <MUITableCell align='right'>{totalAmountDue.toFixed(2)}</MUITableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default InvoicePrint;
