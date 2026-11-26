import { GetServerSideProps } from 'next/types';
import { PrismaClient } from '@prisma/client'; // Adjust the import as needed
import ProductsTable from 'src/views/orders/table/ProductsTable';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Deleted products stay in the table for old orders but leave the list.
    const products = await prisma.products.findMany({
      where: { OR: [{ isdeleted: false }, { isdeleted: null }] },
      orderBy: [{ productname: 'asc' }, { id: 'asc' }]
    });

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
  return (
    <div>
      <ProductsTable products={products} />
    </div>
  );
};

export default ProductsPage;
