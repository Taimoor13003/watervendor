import React from 'react';
import ProductsForm, { ProductRecord } from './ProductsForm';

// Editing uses the same form as adding a product, filled with this product.
const EditProductsForm = ({ productData }: { productData: ProductRecord }) => <ProductsForm product={productData} />;

export default EditProductsForm;
