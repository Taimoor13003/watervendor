import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CustomerOutstandingReport from 'src/views/orders/table/CustomerOutstandingReport';
import { Button } from '@mui/material';

function Index() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerOutstandingData, setCustomerOutstandingData] = useState<any[]>([]); 

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('/api/customerOutstandingNames');
        setCustomers(response.data); 
        console.log(response.data, 'response of customer name API');
      } catch (error) {
        console.error('Error fetching customer names:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleCustomerChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCustomer(event.target.value as string); 
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.get("/api/customeroutstanding", {
        params: { customerId: selectedCustomer }
      });

      setCustomerOutstandingData(response.data);
      console.log('Customer Outstanding Data:', response.data);
    } catch (error) {
      console.error('Error fetching customer outstanding data:', error);
    }
  };

  return (
    <div>
      <FormControl fullWidth margin="normal">
        <InputLabel id="customerName-label">Customer Name</InputLabel>
        <Select
          labelId="customerName-label"
          value={selectedCustomer}
          // @ts-ignore
          onChange={handleCustomerChange}
          label="Customer Name"
          required
        >
          {customers.map((customer: { customerid: number; firstname: string; lastname: string }) => (
            <MenuItem key={customer.customerid} value={customer.customerid}>
              {`${customer.firstname} ${customer.lastname}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained"
        color="primary" onClick={handleSubmit}>Submit</Button>

      <CustomerOutstandingReport data={customerOutstandingData} />
    </div>
  );
}

export default Index;
