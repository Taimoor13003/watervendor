import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const customers = await prisma.$queryRaw`
      SELECT customerid, firstname, lastname
      FROM customer
      ORDER BY firstname ASC
    `;

    res.status(200).json({ customers }); // ✅ wrap result in an object
  } catch (error) {
    console.error('Error fetching customer names:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
