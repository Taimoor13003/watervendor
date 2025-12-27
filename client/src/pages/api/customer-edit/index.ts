import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';
import { serializeDate } from 'src/@core/utils/date';

type CustomerRow = {
  id: number;
  customerid: number | null;
  firstname: string | null;
  lastname: string | null;
  datefirstcontacted: Date | string | null;
  customertype: string | null;
  dateofbirth: Date | string | null;
  accountno: string | null;
  telephoneres: string | null;
  telephoneoffice: string | null;
  addressres: string | null;
  email: string | null;
  deliverydate: Date | string | null;
  deliveryarea: string | null;
  paymentmode: string | null;
  notes: string | null;
  addressoffice: string | null;
  depositamount: number | null;
  requirement: string | null;
  delivery_person: any;
  reqbottles: number | null;
  tax: number | null;
  rate_per_bottle: number | null;
  istaxable: boolean | null;
  isdepositvoucherdone: boolean | null;
  gender: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Missing customer id' });
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
      prisma.$queryRaw<CustomerRow[]>`
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
          ) AS delivery_person_obj
        FROM customer c
        LEFT JOIN employee_personal ep ON c.delivery_person = ep.empid
        WHERE c.customerid = ${Number(id)} AND (c.isdeleted IS DISTINCT FROM TRUE)
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
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customer = customerData[0];

    const serializedEmployee = employee.map(emp => ({
      ...emp,
      empid: emp.empid ? emp.empid.toString() : '',
      doj: serializeDate(emp.doj),
      salarypaydate: serializeDate(emp.salarypaydate),
      dob: serializeDate(emp.dob),
    }));

    const serializedPaymentMode = paymentmode.map(pm => ({
      ...pm,
      requirement: 'Default Requirement' // schema lacks requirement; keep client happy
    }));

    const formatDate = (date: Date | string | null) => {
      if (!date) return '';
      try {
        return new Date(date as any).toISOString().split('T')[0];
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
      delivery_person: (customer as any).delivery_person_obj,
      dateofbirth: formatDate(customer.dateofbirth),
      datefirstcontacted: formatDate(customer.datefirstcontacted),
      deliverydate: formatDate(customer.deliverydate),
      istaxable: customer.istaxable ?? false,
      isdepositvoucherdone: customer.isdepositvoucherdone ?? false,
      gender: customer.gender || 'Mr',
    };

    return res.status(200).json({
      customerData: serializedCustomer,
      customerTypes,
      pickrequirement,
      paymentmode: serializedPaymentMode,
      employee: serializedEmployee,
      deliveryAreas,
    });
  } catch (error: any) {
    console.error('Error loading customer edit data:', error);
    return res.status(500).json({ message: 'Failed to load customer' });
  } finally {
    await prisma.$disconnect();
  }
}
