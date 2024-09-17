
import React from 'react';
import { useRouter } from 'next/router';

  // @ts-ignore

import prisma from 'src/lib/prisma';

import CustomerInvoiceTable from 'src/views/orders/table/CustomerInvoiceTable';

  // @ts-ignore

function Index({ customers }) {
  const router = useRouter();
  const { q } = router.query;
  console.log(customers,q);

  return (
    <div>
      <CustomerInvoiceTable data={customers} />
    </div>
  );
}

export default Index;

export const getServerSideProps = async () => {
  // @ts-ignore

  const customers = await prisma.customer.findMany();

  // Serialize all date fields
  // @ts-ignore

  const serializedCustomers = customers.map(customer => ({
    ...customer,
    datefirstcontacted: customer.datefirstcontacted ? customer.datefirstcontacted.toISOString() : null,
    dateofbirth: customer.dateofbirth ? customer.dateofbirth.toISOString() : null,
  }));

  console.log(serializedCustomers[0], "serialized customers");

  return {
    props: {
      customers: serializedCustomers,
    },
  };
};
