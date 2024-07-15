import React from "react"
import prisma from '../../../lib/prisma';


export const getServerSideProps: any = async () => {
//   const prisma = new PrismaClient();/
  const customers = await prisma.customer.findMany();
  console.log(customers);

  return {
    props: {
      customers,
    },
  };
}



const Test = (props) => {
    console.log(props)
   
  return <> Home Pageecvqwvqvq</>
}

export default Test;
