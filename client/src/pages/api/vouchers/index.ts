import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client'; 
import { vouchertypes } from 'src/constant';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, searchText = '' } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const offset = (pageNumber - 1) * limitNumber;
      const searchPattern = `%${searchText}%`;

      // Build CASE expression for voucher type name lookup
      const typeCase = vouchertypes
        .map(t => `WHEN ${t.id} THEN '${t.name.replace(/'/g, "''")}'`)
        .join(' ');
      const typeCaseExpr = `CASE v.vouchertype ${typeCase} ELSE '' END`;

      const vouchers = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT v.*, ${typeCaseExpr} AS vouchertype_name
        FROM vouchers v
        WHERE (
          CAST(v.voucherno AS varchar) ILIKE $1
          OR CAST(v.voucheramount AS varchar) ILIKE $1
          OR CAST(v.voucherdate AS varchar) ILIKE $1
          OR ${typeCaseExpr} ILIKE $1
          OR COALESCE(v.description, '') ILIKE $1
        )
        ORDER BY v.voucherdate DESC NULLS LAST, v.id DESC
        LIMIT $2
        OFFSET $3
      `,
        searchPattern,
        limitNumber,
        offset
      );

      const totalCount = await prisma.vouchers.count();

      const typeMap = new Map(vouchertypes.map(t => [t.id, t.name]));
      const decorated = (vouchers as any[]).map(v => ({
        ...v,
        vouchertype: typeMap.get(v.vouchertype as number) ?? v.vouchertype,
      }));

      return res.status(200).json({ data: decorated, count: totalCount });
    } catch (error) {
      console.log(error, 'error');
      return res.status(400).json({ message: 'Something went wrong!' });
    }
  } else if (req.method === 'POST') {
    try {
      const { description, vouchertype, voucherdate, transactions = [] } = req.body;

      if (!description || !voucherdate || !Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ message: 'Missing description, voucherdate, or transactions' });
      }

      const parsedDate = new Date(voucherdate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid voucherdate' });
      }

      const totals = transactions.reduce(
        (acc: { debit: number; credit: number }, t: any) => ({
          debit: acc.debit + (Number(t.debit) || 0),
          credit: acc.credit + (Number(t.credit) || 0),
        }),
        { debit: 0, credit: 0 }
      );

      const typeMap = new Map(
        vouchertypes.map(t => [t.name.toLowerCase(), t.id])
      );
      const typeId = typeof vouchertype === 'number'
        ? vouchertype
        : typeMap.get(String(vouchertype).toLowerCase()) ?? null;

      const nextNumber = (await prisma.vouchers.count()) + 1;
      const voucherRecord = await prisma.vouchers.create({
        data: {
          voucherno: nextNumber,
          voucherdate: parsedDate,
          description,
          voucheramount: Math.max(totals.debit, totals.credit),
          vouchertype: typeId,
          modifydate: new Date(),
        },
      });

      // persist transactions
      await prisma.voucher_trans.createMany({
        data: transactions.map((t: any) => ({
          voucherno: voucherRecord.voucherno ?? voucherRecord.id,
          accountcode: t.accountCode || '',
          chqno: t.chqno || '',
          debitamount: Number(t.debit) || 0,
          creditamount: Number(t.credit) || 0,
        })),
      });

      return res.status(201).json({ message: 'Voucher created', voucherno: voucherRecord.voucherno });
    } catch (error) {
      console.error('Error creating voucher:', error);
      return res.status(500).json({ message: 'Failed to create voucher' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}