
  import React from 'react';
  import { useRouter } from 'next/router';
  import { Customer } from 'src/types/customer';
  import { customer as PrismaCustomer } from '@prisma/client';

  import CustomerTable from 'src/views/orders/table/CustomerTable';

    // @ts-ignore

  import prisma from 'src/lib/prisma';

    // @ts-ignore

  function Index({ customers }: { customers: Customer[] }) {
    const router = useRouter();
    const { q } = router.query;
    console.log(customers,q);

    return (
      <div>
        <CustomerTable data={customers} />
      </div>
    );
  }

  export default Index;

  export const getServerSideProps = async () => {
    let customers: PrismaCustomer[] = []

    try {
      customers = await prisma.customer.findMany({
        where: { isdeleted: { not: true } },
        orderBy: { id: 'desc' }
      });
    } catch (error) {
      customers = [];
    }

    // @ts-ignore
    const serializedCustomers = customers.map(customer => ({
      ...customer,
      accountclosedate: customer.accountclosedate ? customer.accountclosedate.toISOString() : null,
      dateofbirth: customer.dateofbirth ? customer.dateofbirth.toISOString() : null,
      datefirstcontacted: customer.datefirstcontacted ? customer.datefirstcontacted.toISOString() : null,
      deliverydate: customer.deliverydate ? customer.deliverydate.toISOString() : null,
      modifydate: customer.modifydate ? customer.modifydate.toISOString() : null,
    }));

    return {
      props: {
        customers: serializedCustomers,
      },
    };
  }
