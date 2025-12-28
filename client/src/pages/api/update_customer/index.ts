import type { NextApiRequest, NextApiResponse } from 'next/types'
import prisma from 'src/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { customerid, ...data } = req.body;

    const idValue = customerid ?? data.customerid;
    const numericCustomerId = Number(idValue);

    if (Number.isNaN(numericCustomerId)) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const {
      id,
      delivery_person,
      reqbottles,
      depositamount,
      tax,
      rate_per_bottle,
      notes,
      // client-only helper object, not a DB column
      delivery_person_obj,
      ...restData
    } = data;

    const toNumberOrNull = (value: any) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    };

    const updatedCustomer = await prisma.customer.update({
      // Use primary key for update (Prisma requires unique field)
      where: { id: numericCustomerId },
      data: {
        ...restData,
        notes: notes === null ? '' : notes, // Explicitly convert null to empty string
        delivery_person: toNumberOrNull(delivery_person),
        reqbottles: toNumberOrNull(reqbottles),
        depositamount: toNumberOrNull(depositamount),
        tax: toNumberOrNull(tax),
        rate_per_bottle: toNumberOrNull(rate_per_bottle),
        // Ensure date fields are correctly formatted if they exist
        dateofbirth: data.dateofbirth ? new Date(data.dateofbirth) : null,
        datefirstcontacted: data.datefirstcontacted ? new Date(data.datefirstcontacted) : null,
        deliverydate: data.deliverydate ? new Date(data.deliverydate) : null,
        modifydate: new Date(),
      },
    });

    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return res.status(500).json({ error: 'Unable to update customer' });
  } finally {
    await prisma.$disconnect();
  }
}
