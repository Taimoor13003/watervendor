import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import EditProductsForm from './EditProductsForm';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await prisma.products.findMany();

    // Serialize dates to strings if needed (adjust according to your data schema)
    const serializedProducts = products.map(product => ({
      ...product,
      // Add serialization logic for date fields if necessary
    }));

    return {
      props: {
        productData: serializedProducts[0] || {}, // Assuming you want to edit the first product for now
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        productData: {}, // Return an empty object in case of error
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
