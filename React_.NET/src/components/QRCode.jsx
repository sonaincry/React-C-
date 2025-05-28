import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VatDetails = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const recid = '5637144703'; 

  useEffect(() => {
    axios
      .get(`http://localhost:5252/VATInformation/details?recid=${recid}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err.response?.data || 'Error fetching data');
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>VAT Information - RECID: {recid}</h2>

      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default VatDetails;
