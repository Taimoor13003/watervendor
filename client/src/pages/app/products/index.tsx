import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import ProductsTable from 'src/views/orders/table/ProductsTable';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await prisma.products.findMany();

    const serializedProducts = products.map(product => ({
      ...product,
    }));

    return {
      props: {
        products: serializedProducts,
      },
    };
  } catch (error) {
    console.error(error);
    
    return {
      props: {
        products: [], 
      },
    };
  }
};

type Product = {
  id: number;
  productName: string;
  price: number;
};

type ProductsPageProps = {
  products: Product[];
};

const ProductsPage = ({ products }: ProductsPageProps) => {
  console.log(products,"data")

  return (
    <div>
      <ProductsTable products={products} />
    </div>
  );
};

export default ProductsPage;
