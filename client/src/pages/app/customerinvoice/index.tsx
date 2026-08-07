
import React from 'react';
import { useRouter } from 'next/router';

  // @ts-ignore

import prisma from 'src/lib/prisma';

import CustomerInvoiceTable from 'src/views/orders/table/CustomerInvoiceTable';

  // @ts-ignore

function Index({ customers }) {
  const router = useRouter();
  const { q } = router.query;

  return (
    <div>
      <CustomerInvoiceTable data={customers} />
    </div>
  );
}

export default Index;

export const getServerSideProps = async () => {
  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      customerid: true,
      firstname: true,
      middlename: true,
      lastname: true,
      customertype: true,
      paymentmode: true,
      telephoneres: true,
      telephoneoffice: true,
    },
    orderBy: { firstname: 'asc' },
  })

  return {
    props: {
      customers,
    },
  };
};
