import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import EditCustomerForm from 'src/pages/app/customers/EditCustomerForm';

export type FormValues = {
  id: string;
  firstname: string;
  lastname: string;
  datefirstcontacted: string;
  customertype: string;
  dateofbirth: string;
  accountno: string;
  telephoneres: string;
  telephoneoffice: string;
  addressres: string;
  email: string;
  deliverydate: string;
  deliveryarea: string;
  paymentmode: string;
  notes: string;
  addressoffice: string;
  depositamount: string;
  requirement: string;
  delivery_person: string;
  reqbottles: string;
  tax: string;
  customerid: string;
  rate_per_bottle: string;
  istaxable: boolean;
  isdepositvoucherdone: boolean;
  gender: string;
};

export type CustomerDataFromServer = Omit<FormValues, 'delivery_person'> & {
  delivery_person: { empid: string | null; firstname: string | null; lastname: string | null } | null;
};

type EditPayload = {
  customerData: CustomerDataFromServer;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: { id: number; paymentmode: string; requirement: string }[];
  employee: {
    lastname: string; id: number; empid: string; employeecode: string; firstname: string; middlename: string;
    doj: string | null; salarypaydate: string | null; dob: string | null;
  }[];
  deliveryAreas: { id: number; deliveryarea: string }[];
};

const EditCustomerPage = () => {
  const router = useRouter();
  const { customerid } = router.query;

  const [data, setData] = useState<EditPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!customerid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/customer-edit?id=${customerid}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || 'Failed to load customer');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <CircularProgress />
        <Typography variant="body1">Loading customer...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
        <Typography variant="h6" color="error">
          {error || 'Unable to load customer'}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/app/customers')}>
          Back to customers
        </Button>
      </Box>
    );
  }

  return (
    <EditCustomerForm
      customerData={data.customerData}
      customerTypes={data.customerTypes}
      pickrequirement={data.pickrequirement}
      paymentmode={data.paymentmode}
      deliveryPersons={data.employee}
      deliveryAreas={data.deliveryAreas}
    />
  );
};

export default EditCustomerPage;
