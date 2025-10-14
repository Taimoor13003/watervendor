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

    if (!customerid) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const { id, delivery_person, reqbottles, depositamount, tax, rate_per_bottle, notes, ...restData } = data;

    const updatedCustomer = await prisma.customer.update({
      where: { id: Number(customerid) },
      data: {
        ...restData,
        notes: notes === null ? '' : notes, // Explicitly convert null to empty string
        delivery_person: delivery_person ? Number(delivery_person) : null,
        reqbottles: reqbottles ? Number(reqbottles) : null,
        depositamount: depositamount ? Number(depositamount) : null,
        tax: tax ? Number(tax) : null,
        rate_per_bottle: rate_per_bottle ? Number(rate_per_bottle) : null,
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
