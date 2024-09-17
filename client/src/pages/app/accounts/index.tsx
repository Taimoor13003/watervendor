import { GetServerSideProps } from 'next';
import prisma from 'src/lib/prisma'; // Ensure your Prisma client is correctly configured
import AccountTable from 'src/views/orders/table/AccountTable';

type Account = {
  accountid: number;
  accountname: string;
  accountnumber: string;
  balance: number;
};

type AccountPageProps = {
  accounts: Account[];
};

const AccountPage = ({ accounts }: AccountPageProps) => {
  return <AccountTable data={accounts} />;
};

export const getServerSideProps: GetServerSideProps<AccountPageProps> = async () => {
  try {
    const accounts = await prisma.accounts_head.findMany();

    return {
      props: {
        accounts,
      },
    };
  } catch (error) {
    
    console.error(error);

    return {
      notFound: true,
    };
  }
};

export default AccountPage;
