import { GetServerSideProps } from 'next';
import prisma from 'src/lib/prisma'; // Ensure your Prisma client is correctly configured
import EditOrderForm from './EditOrderForm';
import { serializeDate } from 'src/@core/utils/date';

type Order = {
  orderid: number;
  firstname: string;
  lastname: string;
  orderno: string;
  customerid: number;
  orderdate: Date;
  invoicedate: Date;
  invoicelastprintdate: Date;
  deliverydate: Date;
  bottlereturndatedate: Date;
  paymentmode: string;
  orderStatus: string;
  deliveryaddress: string;
  deliverynotes: string;
  deliveredbyempid: number;
  deliveredbyvehicleregid: string;
  rate_per_bottle: number;
  reqbottles: number;
  
};

type PaymentMode = {
  id: number;
  paymentmode: string;
};

type OrderDetail = {
  productid: number;
  unitprice: number;
  returnqty: number;
  bottlereturndate: Date;
};

type OrderPageProps = {
  orders: Order;
  paymentmode: PaymentMode[];
  orderdetails: OrderDetail[];
};

const EditOrderPage = ({ orders, paymentmode, orderdetails }: OrderPageProps) => {
  return <EditOrderForm data={orders} paymentmode={paymentmode} orderdetails={orderdetails} />;
};

export const getServerSideProps: GetServerSideProps<OrderPageProps> = async (context) => {
  const { query } = context;
  const id = query.orderid as string | undefined;

  if (!id) {
    return {
      notFound: true,
    };
  }

  try {
    // Fetch order data
    const orders = await prisma.$queryRaw<Order[]>`
      SELECT o.*, c.*
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      WHERE o.orderid = ${Number(id)}
      ORDER BY o.deliverydate DESC
    `;

    const paymentmode = await prisma.pick_paymentmode.findMany();
    const orderdetails = await prisma.order_details.findMany({
      where: { orderid: Number(id) },
    });

    // Serialize dates
    const serializedOrders = orders.map(order => ({
      ...order,
      orderdate: serializeDate(order.orderdate),
      invoicedate: serializeDate(order.invoicedate),
      invoicelastprintdate: serializeDate(order.invoicelastprintdate),
      deliverydate: serializeDate(order.deliverydate),
      bottlesReturnedDate: serializeDate(order.bottlesReturnedDate),

      // Combine names into fullName
      fullName: `${order.firstname} ${order.lastname}`,
    }));

    return {
      props: {
        orders: serializedOrders.length ? serializedOrders[0] : {},
        paymentmode: paymentmode || [],
        orderdetails:JSON.stringify(orderdetails) || [],
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
