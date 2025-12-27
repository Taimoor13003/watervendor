import { GetServerSideProps } from 'next/types';
import EditCustomerForm from 'src/pages/app/customers/EditCustomerForm';
import prisma from 'src/lib/prisma';
import { serializeDate } from 'src/@core/utils/date';

// Shape for the form's internal state
export type FormValues = {
  id: string;
  firstname: string;
  lastname: string;
  datefirstcontacted: string;
  customertype: string;
  dateofbirth: string;
  accountno: string;
  telephoneres: string;
  telephoneoffice: string;
  addressres: string;
  email: string;
  deliverydate: string;
  deliveryarea: string;
  paymentmode: string;
  notes: string;
  addressoffice: string;
  depositamount: string;
  requirement: string;
  delivery_person: string; // This will be the empid string
  reqbottles: string;
  tax: string;
  customerid: string;
  rate_per_bottle: string;
  istaxable: boolean;
  isdepositvoucherdone: boolean;
  gender: string;
};

// Shape for data coming from the server
export type CustomerDataFromServer = Omit<FormValues, 'delivery_person'> & {
  delivery_person: { empid: string | null; firstname: string | null; lastname: string | null } | null;
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
  customerData: CustomerDataFromServer;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: PaymentMode[];
  employee: Employee[];
  deliveryAreas: { id: number; deliveryarea: string }[];
};

const EditCustomerPage = ({ customerData, customerTypes, pickrequirement, paymentmode, employee, deliveryAreas }: EditCustomerPageProps) => {
  return (
    <EditCustomerForm
      customerData={customerData}
      customerTypes={customerTypes}
      pickrequirement={pickrequirement}
      paymentmode={paymentmode}
      deliveryPersons={employee} // Ensure this matches the expected type
      deliveryAreas={deliveryAreas}
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
    const [
      customerData,
      customerTypes,
      pickrequirement,
      paymentmode,
      employee,
      deliveryAreas
    ] = await Promise.all([
      prisma.$queryRaw<CustomerDataFromServer[]>`
        SELECT
          c.id,
          c.customerid,
          c.firstname,
          c.lastname,
          c.datefirstcontacted,
          c.customertype,
          c.dateofbirth,
          c.accountno,
          c.telephoneres,
          c.telephoneoffice,
          c.addressres,
          c.email,
          c.deliverydate,
          c.deliveryarea,
          c.paymentmode,
          c.notes,
          c.addressoffice,
          c.depositamount,
          c.requirement,
          c.delivery_person,
          c.reqbottles,
          c.tax,
          c.rate_per_bottle,
          c.istaxable,
          c.isdepositvoucherdone,
          c.gender,
          json_build_object(
            'empid', ep.empid::TEXT,
            'firstname', ep.firstname,
            'lastname', ep.lastname
          ) AS delivery_person
        FROM customer c
        LEFT JOIN employee_personal ep ON c.delivery_person = ep.empid
        WHERE c.customerid = ${Number(id)}
        LIMIT 1
      `,
      prisma.pick_customertype.findMany({ select: { id: true, customertype: true } }),
      prisma.pick_requirement.findMany({ select: { id: true, requirement: true } }),
      prisma.pick_paymentmode.findMany({ select: { id: true, paymentmode: true } }),
      prisma.employee_personal.findMany({
        select: { id: true, empid: true, employeecode: true, firstname: true, middlename: true, lastname: true, doj: true, salarypaydate: true, dob: true }
      }),
      prisma.pick_deliveryarea.findMany({ select: { id: true, deliveryarea: true } })
    ]);
    
    if (!customerData || customerData.length === 0) {
      return {
        notFound: true,
      };
    }

    const customer = customerData[0];

    const serializedEmployee = employee.map(emp => ({
      ...emp,
      empid: emp.empid ? emp.empid.toString() : '', // Convert empid to string or default to empty string if null
      doj: serializeDate(emp.doj),
      salarypaydate: serializeDate(emp.salarypaydate),
      dob: serializeDate(emp.dob),
    }));

    const serializedPaymentMode = paymentmode.map(pm => ({
      ...pm,
      requirement: 'Default Requirement' // schema lacks requirement; provide default
    }));

    const formatDate = (date: Date | string | null) => {
      if (!date) return '';
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch (e) {
        return '';
      }
    };

    const serializedCustomer = {
      ...customer,
      id: customer.id.toString(),
      customerid: customer.customerid?.toString() || '',
      reqbottles: customer.reqbottles?.toString() || '',
      depositamount: customer.depositamount?.toString() || '',
      tax: customer.tax?.toString() || '',
      rate_per_bottle: customer.rate_per_bottle?.toString() || '',
      delivery_person: customer.delivery_person,
      dateofbirth: formatDate(customer.dateofbirth),
      datefirstcontacted: formatDate(customer.datefirstcontacted),
      deliverydate: formatDate(customer.deliverydate),
      istaxable: customer.istaxable ?? false,
      isdepositvoucherdone: customer.isdepositvoucherdone ?? false,
      gender: customer.gender || 'Mr',
    };

    return {
      props: {
        customerData: JSON.parse(JSON.stringify(serializedCustomer)) as CustomerDataFromServer,
        customerTypes,
        pickrequirement,
        paymentmode: serializedPaymentMode,
        employee: serializedEmployee,
        deliveryAreas,
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
