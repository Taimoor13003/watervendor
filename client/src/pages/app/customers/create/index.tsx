import { GetServerSideProps } from 'next';
import { format } from 'date-fns';
import CustomerForm from '../CustomerForm';
import prisma from 'src/lib/prisma';

type FormValues = {
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
  delieverydate: string;
  deliveryarea: string;
  paymentmode: string;
  notes: string;
  addressoffice: string;
  depositamount: string;
  requirement: string;
  delivery_person: string;
  reqbottles: string;
};

type Employee = {
  id: number;
  name: string;
  doj: string | null;
  salarypaydate: string | null;
  dob: string | null;
};

type CustomerFormPageProps = {
  customerData: FormValues;
  customerTypes: { id: number; customertype: string }[];
  pickrequirement: { id: number; requirement: string }[];
  paymentmode: { id: number; paymentmode: string }[];
  deliveryPersons: { id: number; empid: number; employeecode: string; firstname: string; middlename: string; lastname: string }[];
};

const CustomerFormPage = ({ customerData, customerTypes, pickrequirement, paymentmode, deliveryPersons }: CustomerFormPageProps) => {
  return (
    <div>
      <CustomerForm
        customerData={customerData}
        customerTypes={customerTypes}
        pickrequirement={pickrequirement}
        paymentmode={paymentmode}
        deliveryPersons={deliveryPersons}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<CustomerFormPageProps> = async (context) => {
  try {
    const customerData = {
      firstname: '',
      lastname: '',
      datefirstcontacted: '',
      customertype: '',
      dateofbirth: '',
      accountno: '',
      telephoneres: '',
      telephoneoffice: '',
      addressres: '',
      email: '',
      delieverydate: '',
      deliveryarea: '',
      paymentmode: '',
      notes: '',
      addressoffice: '',
      depositamount: '',
      requirement: '',
      delivery_person: '',
      reqbottles: ''
    };

    const customerTypes = await prisma.pick_customertype.findMany();
    const pickrequirement = await prisma.pick_requirement.findMany();
    const paymentmode = await prisma.pick_paymentmode.findMany();
    const deliveryPersons = await prisma.employee_personal.findMany();

    const serializeDate = (date: Date | null) => (date ? format(new Date(date), 'yyyy-MM-dd') : null);

    const serializedDeliveryPersons = deliveryPersons.map(person => ({
      id: person.id,
      empid: person.empid,
      employeecode: person.employeecode,
      firstname: person.firstname,
      middlename: person.middlename,
      lastname: person.lastname,
      doj: serializeDate(person.doj),
      salarypaydate: serializeDate(person.salarypaydate),
      dob: serializeDate(person.dob)
    }));

    return {
      props: {
        customerData,
        customerTypes,
        pickrequirement,
        paymentmode,
        deliveryPersons: serializedDeliveryPersons,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};

export default CustomerFormPage;
