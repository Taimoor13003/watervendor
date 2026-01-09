import React from 'react'
import { GetServerSideProps } from 'next/types';

// Creation is disabled; redirect to products list
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: { destination: '/app/products', permanent: false },
  };
};

const DisabledCreateProductPage = () => null;

export default DisabledCreateProductPage;