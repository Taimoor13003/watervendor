import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import EditVoucherForm from './EditVoucherForm';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const vouchers = await prisma.vouchers.findMany();
    const vouchertrans = await prisma.voucher_trans.findMany();

    // Serialize dates to strings
    const serializedVouchers = vouchers.map(voucher => ({
      ...voucher,
      voucherdate: voucher.voucherdate.toISOString(),
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
        vouchertrans: [], // Return an empty array in case of error
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
  // Add other relevant fields here if needed
};

type VoucherProps = {
  vouchers: {
    id: number;
    voucherCode: string;
    amount: number;
    voucherdate: string; // Date as ISO string
    // Add other relevant fields here if needed
  }[];
  vouchertrans: VoucherTrans[]; // Include the vouchertrans prop
};

const EditVoucher = ({ vouchers, vouchertrans }: VoucherProps) => {
  return (
    <div>
      <EditVoucherForm vouchers={vouchers} vouchertrans={vouchertrans} />
    </div>
  );
};

export default EditVoucher;
