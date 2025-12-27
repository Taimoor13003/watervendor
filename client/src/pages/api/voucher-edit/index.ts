import type { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'src/lib/prisma';
import { serializeDate } from 'src/@core/utils/date';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Missing voucher id' });
  }

  try {
    const voucherData = await prisma.vouchers.findUnique({
      where: { id: Number(id) },
    });

    if (!voucherData) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    const vouchertrans = await prisma.voucher_trans.findMany({
      where: { voucherno: voucherData.voucherno ?? undefined }
    });

    const serializedVoucher = {
      ...voucherData,
      voucherdate: voucherData.voucherdate ? serializeDate(voucherData.voucherdate as unknown as Date) : null,
    };

    return res.status(200).json({
      voucher: serializedVoucher,
      vouchertrans
    });
  } catch (error: any) {
    console.error('Error loading voucher edit data:', error);
    return res.status(500).json({ message: 'Failed to load voucher' });
  } finally {
    await prisma.$disconnect();
  }
}
