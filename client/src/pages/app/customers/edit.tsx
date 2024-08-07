import { GetServerSideProps } from 'next';
import EditCustomerForm from 'src/pages/app/customers/EditCustomerForm';
import prisma from 'src/lib/prisma';
import { serializeDate } from 'src/@core/utils/date';

type FormValues = {
  firstname: string;
  lastname: string;
  datefirstcontacted: string; // Date as string
  customertype: string;
  dateofbirth: string;
  accountno: string;
  telephoneres: string;
  telephoneoffice: string;
  addressres: string;
  email: string;
  delieverydate: string;
  deliveryarea: string;
  paymentmode: string;
  notes: string;
  addressoffice: string;
  depositamount: string;
  requirement: string;
  delivery_person: { empid: string, firstname: string, lastname: string };
  reqbottles: string;
};

type Employee = {
  id: number;
  empid: number;
  employeecode: string;
  firstname: string;
  middlename: string;
  lastname: string;
  doj: Date | null;
  salarypaydate: Date | null;
  dob: Date | null; // Added dob
};

type EditCustomerPageProps = {
  customerData: FormValues;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: { id: number; paymentmode: string }[];
  employee: Employee[];
};

const EditCustomerPage = ({ customerData, customerTypes, pickrequirement, paymentmode, employee }: EditCustomerPageProps) => {
  return <EditCustomerForm customerData={customerData} customerTypes={customerTypes} pickrequirement={pickrequirement} paymentmode={paymentmode} deliveryPersons={employee} />;
};

export const getServerSideProps: GetServerSideProps<EditCustomerPageProps> = async (context : any) => {
  const { query } = context;
  const id = query.customerid as string | undefined;

  console.log(id , "idddddddddd")

  if (!id) {
    return {
      notFound: true,
    };
  }

  try {
    // const customerData = await prisma.customer.findUnique({
    //   where: { id: parseInt(id, 10) },
    // });

    // const customerData = await prisma.$queryRaw `SELECT c.*, json_build_object( 'empid',ep.empid, 'firstname',ep.firstname,'lastname',ep.lastname) AS delivery_person FROM customer c LEFT JOIN employee_personal ep ON c.delivery_person = ep.empid where c.customerid=941`;
    const customerData = await prisma.$queryRaw`
  SELECT
    c.*,
    json_build_object(
      'empid', ep.empid,
      'firstname', ep.firstname,
      'lastname', ep.lastname
    ) AS delivery_person
  FROM
    customer c
  LEFT JOIN
    employee_personal ep
  ON
    c.delivery_person = ep.empid
  WHERE
    c.customerid = ${Number(id)}
`;
    if (!customerData) {
      return {
        notFound: true,
      };
    }

    const customerTypes = await prisma.pick_customertype.findMany();
    const pickrequirement = await prisma.pick_requirement.findMany();
    const paymentmode = await prisma.pick_paymentmode.findMany();
    const employee = await prisma.employee_personal.findMany();

    const serializedEmployee = employee.map(emp => ({
      ...emp,
      doj: serializeDate(emp.doj),
      salarypaydate: serializeDate(emp.salarypaydate),
      dob: serializeDate(emp.dob),
    }));

    return {
      props: {
        customerData: JSON.stringify(customerData),
        // ...customerData,
        // datefirstcontacted: serializeDate(customerData.datefirstcontacted),
        // dateofbirth: serializeDate(customerData.dateofbirth),
        customerTypes,
        pickrequirement,
        paymentmode,
        employee: serializedEmployee,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};

export default EditCustomerPage;

function json_build_object(arg0: string, empid: any, arg2: string, firstname: any, arg4: string, lastname: any) {
  throw new Error('Function not implemented.');
}
