// src/views/apps/invoice/preview/PreviewCard.tsx

import React from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import { format } from 'date-fns';
import Image from 'next/image';
import { SingleInvoiceType } from 'src/types/apps/invoiceTypes';

interface PreviewCardProps {
  data: SingleInvoiceType[]; // Expecting an array
}

const PreviewCard: React.FC<PreviewCardProps> = ({ data }) => {
  const theme = useTheme();

  const datanew = Array.isArray(data) ? data : [];
  const totalBottlesDelivered = datanew.reduce((total: number, current) => total + (current.orderqty || 0), 0);
  const totalBottlesReturned = datanew.reduce((total: number, current) => total + (current.reqbottles || 0), 0);

  if (datanew.length === 0) {
    return null;
  }

  const firstItem = datanew[0] || {};
  const firstname = firstItem?.firstname || 'N/A';
  const lastname = firstItem?.lastname || 'N/A';
  const address = firstItem?.addressres || 'N/A';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    return format(date, 'dd/MM/yyyy');
  };
  console.log(firstItem.accountno,'alllllllllllll')
  const currentDate = format(new Date(), 'EEEE, dd MMMM, yyyy');

  const totalAmountDue = datanew.reduce((total: number, item) => {

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
            gap: 2
          }}
        >
          <Box>
            <Image 
              src='/images/avatars/5.-Manfaat-ISO-22000-Bagi-Bisnis.webp'
              alt="Left" 
              width={150}
              height={100} 
            />
          </Box>
          {/* Center logo: crop 2px from the right to hide embedded separator line */}
          <Image
            src="/images/avatars/WhatsApp Image 2024-09-04 at 01.17.42_00181990.jpg"
            alt="Center"
            width={330}
            height={150}
            style={{
              objectFit: 'contain',
              display: 'block',
              clipPath: 'inset(0 2px 0 0)'
            }}
          />

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
          Account no.# {firstItem.accountno}
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
            {datanew.map((newData: any, index) => {
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
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                  fontWeight: 700
                }
              }}
            >
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
  );
};

export default PreviewCard;
