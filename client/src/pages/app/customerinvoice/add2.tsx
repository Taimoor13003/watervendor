import { useEffect, useState, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard';
import { useRouter } from 'next/router';
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker';
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions';

const InvoiceAdd = () => {
  const [invoiceData, setInvoiceData] = useState<any>({}); // Changed to object for grouped data

  const router = useRouter();
  const id = router.query.customerid;
  const date1 = router.query.startDate;
  const date2 = router.query.endDate;

  const handleDateFormat = (date: any) => {
    const inputDate = new Date(date);
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const hours = String(inputDate.getHours()).padStart(2, '0');
    const minutes = String(inputDate.getMinutes()).padStart(2, '0');
    const seconds = String(inputDate.getSeconds()).padStart(2, '0');
    const milliseconds = String(inputDate.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get('/api/invoice', {
        params: {
          customerids: id,  
          startDate: handleDateFormat(date1),
          endDate: handleDateFormat(date2),
        },
      });
      setInvoiceData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [id, date1, date2]); 

  useEffect(() => {
    if (id && date1 && date2) {
      fetchData();
    }
  }, [id, date1, date2, fetchData]); 

  console.log(invoiceData, 'invoiceData');

  return (
    <DatePickerWrapper sx={{ '& .react-datepicker-wrapper': { width: 'auto' } }}>
      <Grid container spacing={6}>
        {Object.keys(invoiceData).map((customerId) => (
          <Grid container item xs={12} key={customerId} spacing={2}>
            <Grid item xl={9} md={8} xs={12}>
              <PreviewCard data={invoiceData[customerId]} />
            </Grid>
            <Grid item xl={3} md={4} xs={12}>
              <PreviewActions
                id={customerId}
                startDate={date1}
                endDate={date2}
                toggleAddPaymentDrawer={() => {
                  console.log('Add Payment Drawer triggered');

                }}
                toggleSendInvoiceDrawer={() => {
                  console.log('Send Invoice Drawer triggered');

                }}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </DatePickerWrapper>
  );
};

export default InvoiceAdd;
