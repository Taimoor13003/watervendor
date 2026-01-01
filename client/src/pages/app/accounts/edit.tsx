import { GetServerSideProps } from 'next/types';
import prisma from 'src/lib/prisma'; // Ensure your Prisma client is correctly configured
import EditAccountForm from './EditAccountForm';

type Account = {
  id?: number;
  accountid: number;
  accountname: string;
  accountnumber: string;
  balance: number;
  accountcode: string;
  accounttype: number;
  openingbalance: number;
  remarks: string | null;
};

type AccountPageProps = {
  accountData: Account | null; // Adjust based on single account data
};

const AccountPage = ({ accountData }: AccountPageProps) => {
  return <EditAccountForm accountData={accountData} />;
};

//@ts-ignore
export const getServerSideProps: GetServerSideProps<AccountPageProps> = async (context) => {
  try {
    const accountid = context.query.accountid;
    const idNumber = accountid ? Number(accountid) : null;

    if (!idNumber || Number.isNaN(idNumber)) {
      return { redirect: { destination: '/app/accounts', permanent: false } };
    }

    const accountData = await prisma.accounts_head.findFirst({
      where: {
        OR: [
          { accountid: idNumber },
          { id: idNumber }
        ]
      }
    });

    return {
      props: {
        accountData: accountData || null,
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
