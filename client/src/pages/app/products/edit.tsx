import { GetServerSideProps } from 'next/types';
import { PrismaClient } from '@prisma/client';
import EditProductsForm from './EditProductsForm';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const idParam = context.query.id ?? context.query.productid;
    const idNumber = idParam ? Number(idParam) : null;

    if (!idNumber || Number.isNaN(idNumber)) {
      return { redirect: { destination: '/app/products', permanent: false } };
    }

    const product = await prisma.products.findFirst({ where: { id: idNumber } });

    if (!product) {
      return { redirect: { destination: '/app/products', permanent: false } };
    }

    return {
      props: {
        productData: product,
      },
    };
  } catch (error) {
    console.error(error);
    
    return {
      redirect: { destination: '/app/products', permanent: false },
    };
  }
};

type ProductProps = {
  productData: {
    id: number;
    productcode: string;
    productname: string;
    unitsinstock: number;
    totalunits: number;
    rateperunitcash: number;
    rateperunitcoupon: number;
    remarks: string;
    isactive?: boolean | null;
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
