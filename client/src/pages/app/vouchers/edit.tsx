import { GetServerSideProps } from 'next/types';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import EditVoucherForm from './EditVoucherForm';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const vouchers = await prisma.vouchers.findMany();
    const vouchertrans = await prisma.voucher_trans.findMany();

    const serializedVouchers = vouchers.map(voucher => ({
      ...voucher,
      voucherdate: voucher.voucherdate ? voucher.voucherdate.toISOString() : null, // Handle null case
    }));

    return {
      props: {
        vouchers: serializedVouchers,
        vouchertrans, // Pass vouchertrans data to the component
      },
    };
  } catch (error) {
    console.error(error);

    return {
      props: {
        vouchers: [],
        vouchertrans: [], 
      },
    };
  }
};

type VoucherTrans = {
  id: number;
  voucherId: number;
  transactionCode: string;
  transactionDate: string;
  amount: number;
};

type VoucherProps = {
  vouchers: {
    id: number;
    voucherCode: string;
    amount: number;
    voucherdate: string | null; // Update type to handle null
  }[];
  vouchertrans: VoucherTrans[]; // Include the vouchertrans prop
};

const EditVoucher = ({ vouchers, vouchertrans }: VoucherProps) => {
  return (
    
    //@ts-ignore
  
      <EditVoucherForm vouchers={vouchers} vouchertrans={vouchertrans} />
  );
};

export default EditVoucher;
