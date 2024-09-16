import React, { useState } from 'react';
import RatePerBottleTable from 'src/views/orders/table/RatePerBottleTable';

const InputComponent = () => {
  const [ratePerBottle, setRatePerBottle] = useState<number | ''>('');
  const [tableData, setTableData] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratePerBottle === '') {
      return;
    }
  
    try {
      const response = await fetch(`/api/getCustomers?rate=${encodeURIComponent(ratePerBottle.toString())}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Log the fetched data
      console.log('Fetched data:', data);
      
      setTableData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="ratePerBottle">Type rate per bottle here:</label>
        <input
          id="ratePerBottle"
          type="number"
          value={ratePerBottle}
          onChange={(e) => setRatePerBottle(Number(e.target.value))}
          required
        />
        <button type="submit">Submit</button>
      </form>

      {/* Render the table with the fetched data */}
      {tableData.length > 0 && <RatePerBottleTable data={tableData} ratePerBottle={Number(ratePerBottle)} />}
    </div>
  );
};

export default InputComponent;
