import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import EditOrderForm from './EditOrderForm';

type Order = {
  orderid: number;
  firstname: string;
  lastname: string;
  orderno: string;
  customerid: number;
  orderdate: string | null;
  invoicedate: string | null;
  invoicelastprintdate: string | null;
  deliverydate: string | null;
  bottlereturndate?: string | null;
  paymentmode: string;
  orderstatus: string;
  deliveryaddress: string;
  deliverynotes: string;
  deliveredbyempid?: number | null;
  deliveredbyvehicleregid?: string | null;
  rate_per_bottle?: number | null;
  reqbottles?: number | null;
  employeefirstname?: string | null;
  employeelastname?: string | null;
  orderqty: number | string;
  orderamount?: number | null;
};

type PaymentMode = {
  id: number;
  paymentmode: string;
};

type OrderDetail = {
  productid: number | null;
  unitprice: number | null;
  returnqty: number | null;
  bottlereturndate: string | null;
};

type EditOrderPayload = {
  orders: Order;
  paymentmode: PaymentMode[];
  orderdetails: OrderDetail[];
};

const EditOrderPage = () => {
  const router = useRouter();
  const { orderid } = router.query;

  const [data, setData] = useState<EditOrderPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/order-edit?id=${orderid}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || 'Failed to load order');
        }
        const json = await res.json();
        const normalized = {
          ...json,
          orders: {
            ...json.orders,
            orderamount:
              json.orders?.orderamount === null || json.orders?.orderamount === undefined
                ? null
                : Number(json.orders.orderamount),
            orderqty:
              json.orders?.orderqty === null || json.orders?.orderqty === undefined
                ? null
                : Number(json.orders.orderqty),
          },
        };
        setData(normalized);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <CircularProgress />
        <Typography variant="body1">Loading order...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
        <Typography variant="h6" color="error">
          {error || 'Unable to load order'}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/app/orders')}>
          Back to orders
        </Button>
      </Box>
    );
  }

  return (
    <EditOrderForm
      data={data.orders}
      paymentmode={data.paymentmode}
      orderdetails={data.orderdetails}
    />
  );
};

export default EditOrderPage;
