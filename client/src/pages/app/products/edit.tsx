import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import EditProductsForm from './EditProductsForm';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await prisma.products.findMany();

    const serializedProducts = products.map(product => ({
      ...product,
    }));

    return {
      props: {
        productData: serializedProducts[0] || {}, 
      },
    };
  } catch (error) {
    console.error(error);
    
    return {
      props: {
        productData: {},
      },
    };
  }
};

type ProductProps = {
  productData: {
    productcode: string;
    productname: string;
    unitsinstock: number;
    totalunits: number;
    rateperunitcash: number;
    rateperunitcoupon: number;
    remarks: string;
  };
};

const EditProduct = ({ productData }: ProductProps) => {
  return (
    <div>
      <EditProductsForm productData={productData} />
    </div>
  );
};

export default EditProduct;
