import React, { useState, useEffect } from 'react';
import ProductReport from 'src/views/orders/table/ProductReport';

const Index = () => {
  const [productData, setProductData] = useState([]);

  const fetchProductData = async () => {
    try {
      const response = await fetch('/api/productsreports'); 
      const data = await response.json(); 
      setProductData(data.result || []); 
      console.log(data, 'Fetched Product Dataaaaaaaaaa');
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchProductData(); 
  }, []); 

  return (
    <div>
      <ProductReport data={productData} />
    </div>
  );
};

export default Index;
