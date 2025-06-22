import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {

        try {

            const { page = 1, limit = 10, searchText = '' } = req.query;
            const pageNumber = parseInt(page as string)
            const limitNumber = parseInt(limit as string);
            const offset = (pageNumber - 1) * limitNumber;
            const searchPattern = `%${searchText}%`;

            const vouchers = await prisma.$queryRaw`
                SELECT *
                FROM vouchers
                WHERE CAST(voucherno AS varchar) ILIKE ${searchPattern}
                OR CAST(voucheramount AS varchar) ILIKE ${searchPattern}
                OR CAST(voucherdate AS varchar) ILIKE ${searchPattern}
                ORDER BY id
                LIMIT ${limitNumber}
                OFFSET ${offset}
                `;

            const totalCount = await prisma.vouchers.count();

            res.status(200).json({ data: vouchers, count: totalCount });

        } catch (error) {
            console.log(error, 'error')
            res.status(400).json({ message: "Something went wrong!" });
        }

    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}