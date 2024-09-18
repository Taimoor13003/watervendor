import { GetServerSideProps } from 'next/types';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import VoucherTable from 'src/views/orders/table/VoucherTable';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const vouchers = await prisma.vouchers.findMany({
      take: 10,
      skip: 0,
    });

    const serializedVouchers = vouchers.map(voucher => ({
      ...voucher,
      voucherdate: voucher?.voucherdate ? voucher.voucherdate.toISOString() : "",
    }));

    return {
      props: {
        vouchers: serializedVouchers
      },
    };
  } catch (error) {
    console.error(error);
    
    return {
      props: {
        vouchers: [], // Return an empty array in case of error
      },
    };
  }
};

type VoucherProps = {
  vouchers: {
    id: number;
    voucherCode: string;
    voucherType: string;
    amount: number;
    voucherdate: Date; // Date as ISO string
  }[];
};

const EditPage = ({ vouchers }: VoucherProps) => {
  return (

//@ts-ignore

      <VoucherTable vouchers={vouchers} />
  );
};

export default EditPage;
