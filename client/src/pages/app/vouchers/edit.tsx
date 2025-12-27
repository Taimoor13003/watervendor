import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import EditVoucherForm from './EditVoucherForm';

type Voucher = {
  id: number;
  voucherno: number | null;
  voucherdate: string | null;
  voucheramount: number | null;
  description: string | null;
  vouchertype: number | null;
};

type VoucherTrans = {
  id: number;
  voucherno: number | null;
  accountcode: string | null;
  chqno: string | null;
  debitamount: number | null;
  creditamount: number | null;
};

type VoucherPayload = {
  voucher: Voucher;
  vouchertrans: VoucherTrans[];
};

const EditVoucher = () => {
  const router = useRouter();
  const { voucherid } = router.query;

  const [data, setData] = useState<VoucherPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!voucherid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/voucher-edit?id=${voucherid}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || 'Failed to load voucher');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Failed to load voucher');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [voucherid]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <CircularProgress />
        <Typography variant="body1">Loading voucher...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
        <Typography variant="h6" color="error">
          {error || 'Unable to load voucher'}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/app/vouchers')}>
          Back to vouchers
        </Button>
      </Box>
    );
  }

  return <EditVoucherForm vouchers={[data.voucher]} vouchertrans={data.vouchertrans} />;
};

export default EditVoucher;
