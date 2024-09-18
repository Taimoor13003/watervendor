// src/views/app/invoice/preview/InvoicePreview.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { SingleInvoiceType, InvoiceLayoutProps } from 'src/types/apps/invoiceTypes';
import PreviewCard from 'src/views/apps/invoice/preview/PreviewCard';
import PreviewActions from 'src/views/apps/invoice/preview/PreviewActions';
import AddPaymentDrawer from 'src/views/apps/invoice/shared-drawer/AddPaymentDrawer';
import SendInvoiceDrawer from 'src/views/apps/invoice/shared-drawer/SendInvoiceDrawer';

const InvoicePreview: React.FC<InvoiceLayoutProps> = ({ id }) => {
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<SingleInvoiceType[]>([]); // Ensure data is an array
  const [addPaymentOpen, setAddPaymentOpen] = useState<boolean>(false);
  const [sendInvoiceOpen, setSendInvoiceOpen] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get('/apps/invoice/single-invoice', { params: { id } })
      .then(res => {
        // Ensure data is always an array
        const invoiceData = res.data ? [res.data] : [];
        setData(invoiceData);
        setError(false);
      })
      .catch(() => {
        setData([]); // Ensure data is an empty array in case of error
        setError(true);
      });
  }, [id]);

  const toggleSendInvoiceDrawer = () => setSendInvoiceOpen(!sendInvoiceOpen);
  const toggleAddPaymentDrawer = () => setAddPaymentOpen(!addPaymentOpen);

  if (data.length > 0) {
    return (
      <>
        <Grid container spacing={6}>
          <Grid item xl={9} md={8} xs={12}>
            <PreviewCard data={data} /> {/* Pass data as an array */}
          </Grid>
          <Grid item xl={3} md={4} xs={12}>
            <PreviewActions
            
              //@ts-ignore
              id={id}
              toggleAddPaymentDrawer={toggleAddPaymentDrawer}
              toggleSendInvoiceDrawer={toggleSendInvoiceDrawer}
            />
          </Grid>
        </Grid>
        <SendInvoiceDrawer open={sendInvoiceOpen} toggle={toggleSendInvoiceDrawer} />
        <AddPaymentDrawer open={addPaymentOpen} toggle={toggleAddPaymentDrawer} />
      </>
    );
  } else if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='error'>
            Invoice with the id: {id} does not exist. Please check the list of invoices:{' '}
            <Link href='/apps/invoice/list'>Invoice List</Link>
          </Alert>
        </Grid>
      </Grid>
    );
  } else {
    return null;
  }
};

export default InvoicePreview;
