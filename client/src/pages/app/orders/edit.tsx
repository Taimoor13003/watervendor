import { GetServerSideProps } from 'next/types';
import prisma from 'src/lib/prisma';
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
  employeefirstname: string;
  employeelastname: string;
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

//@ts-ignore

  return <EditOrderForm data={orders} paymentmode={paymentmode} orderdetails={orderdetails} />;
};

//@ts-ignore

export const getServerSideProps: GetServerSideProps<OrderPageProps> = async (context) => {
  const { query } = context;
  const id = query.orderid as string | undefined;

  if (!id) {
    return { notFound: true };
  }

  try {
    const orders = await prisma.$queryRaw<Order[]>`
      SELECT 
      ep.empid, ep.firstname as employeeFirstName, ep.lastname as employeeLastName,
      c.customerid, c.firstname as customerFirstName, c.lastname as customerLastName,
      od.returnqty, od.productid, od.bottlereturndate,
      p.productname,
      o.*
      FROM orders o
      LEFT JOIN customer c ON o.customerid = c.customerid
      LEFT JOIN employee_personal ep ON ep.empid = o.deliveredbyempid 
      LEFT JOIN order_details od ON o.orderid = od.orderid 
      LEFT JOIN products p ON p.id = od.productid
      WHERE o.orderid = ${Number(id)}
    `;

    const paymentmode = await prisma.pick_paymentmode.findMany();
    const orderdetails = await prisma.order_details.findMany({
      where: { orderid: Number(id) },
    });

    const serializedOrders = orders.map(order => ({
      ...order,
      orderdate: serializeDate(order.orderdate),
      invoicedate: serializeDate(order.invoicedate),
      invoicelastprintdate: serializeDate(order.invoicelastprintdate),
      deliverydate: serializeDate(order.deliverydate),
      bottlereturndatedate: serializeDate(order.bottlereturndatedate),
    }));

    return {
      props: {
        orders: serializedOrders.length ? serializedOrders[0] : {} as Order,
        paymentmode: paymentmode || [],
        orderdetails: orderdetails || [],
      },
    };
  } catch (error) {
    console.error(error);
    
    return { notFound: true };
  }
};

export default EditOrderPage;
