
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Customer } from 'src/types/customer';
import CustomerTable from 'src/views/orders/table/CustomerTable';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function Index() {
  const router = useRouter();
  const { q } = router.query;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/allcustomers');
        if (!res.ok) {
          throw new Error('Failed to load customers');
        }
        const { customers } = await res.json();
        setCustomers(customers || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Box>
      {error ? (
        <Box mb={3} display="flex" flexDirection="column" gap={1}>
          <Typography color="error">{error}</Typography>
          <Typography variant="body2" color="text.secondary">
            Please refresh the page to try again.
          </Typography>
        </Box>
      ) : null}

      <CustomerTable
        data={customers}
        loading={loading}
        onDeleteSuccess={id => setCustomers(prev => prev.filter(c => c.id !== id))}
      />
    </Box>
  );
}

export default Index;
