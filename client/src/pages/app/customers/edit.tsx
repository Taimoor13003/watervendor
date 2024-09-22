import { GetServerSideProps } from 'next/types';
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
  tax:string;
};

// Updated Employee type to match EditCustomerForm expectations
type Employee = {
  id: number;
  empid: string; // Changed to string
  employeecode: string;
  firstname: string;
  middlename: string;
  lastname: string;
  doj: Date | null;
  salarypaydate: Date | null;
  dob: Date | null;
};

type PaymentMode = {
  id: number;
  paymentmode: string;
  requirement: string; // Ensure this is included
};

type EditCustomerPageProps = {
  customerData: FormValues;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: PaymentMode[];
  employee: Employee[];
};

const EditCustomerPage = ({ customerData, customerTypes, pickrequirement, paymentmode, employee }: EditCustomerPageProps) => {
  return (
    <EditCustomerForm
      customerData={customerData}
      customerTypes={customerTypes}
      pickrequirement={pickrequirement}
      paymentmode={paymentmode}
      deliveryPersons={employee} // Ensure this matches the expected type
    />
  );
};

//@ts-ignore

export const getServerSideProps: GetServerSideProps<EditCustomerPageProps> = async (context: any) => {
  const { query } = context;
  const id = query.customerid as string | undefined;

  if (!id) {

    return {

      notFound: true,
    };
  }

  try {
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
      empid: emp.empid ? emp.empid.toString() : '', // Convert empid to string or default to empty string if null
      doj: serializeDate(emp.doj),
      salarypaydate: serializeDate(emp.salarypaydate),
      dob: serializeDate(emp.dob),
    }));

    const serializedPaymentMode = paymentmode.map(pm => ({
      ...pm,
      requirement: 'Default Requirement' // Replace this with actual requirement if available
    }));

    return {

      props: {
        customerData: JSON.parse(JSON.stringify(customerData)), // Ensure correct serialization
        customerTypes,
        pickrequirement,
        paymentmode: serializedPaymentMode,
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
