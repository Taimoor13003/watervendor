import { GetServerSideProps } from 'next';
import prisma from 'src/lib/prisma'; // Ensure your Prisma client is correctly configured
import OrderTable from 'src/views/orders/table/OrderTable';

type Order = {
  orderid: number;
  firstname: string;
  lastname: string;
  orderno: string;
  customerid: number;
};

type OrderPageProps = {
  orders: Order[];
};

const EditOrderPage = ({ orders }: OrderPageProps) => {
  return <OrderTable data={orders} />;
};

export const getServerSideProps: GetServerSideProps<OrderPageProps> = async () => {
  try {
    // Run the SQL query using Prisma's `$queryRaw`
    const orders = await prisma.$queryRaw<Order[]>`
      SELECT o.orderid, c.firstname, c.lastname, o.orderno, c.customerid
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      ORDER BY o.deliverydate DESC
    `;

    // Ensure the orders are serialized correctly if necessary
    const serializedOrders = orders.map(order => ({
      ...order,
      // Any additional processing if needed
    }));

    return {
      props: {
        orders: serializedOrders,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};

export default EditOrderPage;
