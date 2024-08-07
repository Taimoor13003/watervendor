import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import VoucherTable from 'src/views/orders/table/VoucherTable';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const vouchers = await prisma.vouchers.findMany();
    // Serialize dates to strings
    const serializedVouchers = vouchers.map(voucher => ({
      ...voucher,
      voucherdate: voucher.voucherdate.toISOString(), // Corrected to use `voucher.voucherdate`
    }));
    return {
      props: {
        vouchers: serializedVouchers,
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
    amount: number;
    voucherdate: string; // Date as ISO string
    // Add other relevant fields here if needed
  }[];
};

const EditPage = ({ vouchers }: VoucherProps) => {
  return (
    <div>
      <VoucherTable vouchers={vouchers} />
    </div>
  );
};

export default EditPage;
