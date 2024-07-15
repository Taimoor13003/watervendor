import React from "react"

// @ts-ignore
import prisma from '../../lib/prisma';





const Test = (props : any) => {
    console.log(props)
   
  return <> Home Pageecvqwvqvq</>
}

export default Test;


export const getServerSideProps: any = async () => {
  //   const prisma = new PrismaClient();/
  
  // @ts-ignore
  const customers = await prisma.customer.findMany();
  console.log(customers);

  return {
    props: {
      customers: JSON.parse(JSON.stringify(customers)),
    },
  };
}
