import React, { useEffect, useState } from 'react';
import Formvalidation2 from 'src/views/forms/form-validation/Formvalidation2';

const CreateOrder = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/allcustomers'); // ✅ updated route here
        const { customers } = await res.json();
        setCustomers(customers);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCustomers();
  }, []);
  

  return (
    // @ts-ignore
    <Formvalidation2 customers={customers} loadingCustomers={loading} />
  );    
};

export default CreateOrder;
