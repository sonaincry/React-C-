import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VatDetails.css';

const VatDetails = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recid, setRecid] = useState(null);

  // const recid = '5637144703';



  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const recidFromUrl = queryParams.get('recid');

    if (recidFromUrl) {
      setRecid(recidFromUrl);
      // setLoading(true) here is not strictly necessary if the other useEffect handles it
      // but ensure error is cleared if we found a new recid
      setError('');
    } else {
      setError('RECID not found in URL. Please ensure the link includes a ?recid=... parameter.');
      setLoading(false); // Stop loading if no recid is found in the URL
    }
  }, []); // Empty dependency array: runs once on component mount

  // useEffect to fetch data when recid is available or changes
  useEffect(() => {
    if (!recid) {
      // If recid is null (e.g., not found in URL), we shouldn't try to fetch.
      // The loading state should have been set to false by the above useEffect if recid wasn't found.
      // If it was found, loading will be true initially or set to true by fetchData.
      if (!error) setLoading(false); // Only set loading to false if there isn't already an error saying recid not found
      return;
    }

    const fetchData = async () => {
      setLoading(true); // Set loading to true before starting fetch
      setError('');     // Clear previous errors
      try {
        const response = await axios.get(`https://satramart.runasp.net/VATInformation/details?recid=${recid}`);
        setData(response.data);
      } catch (err) {
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(err.response.data?.message || JSON.stringify(err.response.data) || `Error fetching data: Server responded with status ${err.response.status}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('Error fetching data: No response from server. Check network connection or API endpoint.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error fetching data: ${err.message}`);
        }
        setData(null); // Clear any old data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recid]);

  const renderDataRow = (label, value) => {
    const displayValue = (value === null || value === undefined || value === "") ? "N/A" : value.toString();
    return (
      <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{displayValue}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="vat-details-container">
        <h2>VAT Information</h2>
        <p className="loading-message">Loading VAT details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vat-details-container">
        <h2>VAT Information</h2>
        <p className="error-message">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="vat-details-container">
        <h2>VAT Information</h2>
        <p className="no-data-message">No data found for RECID: {recid}</p>
      </div>
    );
  }
  return (
    <div className="vat-details-container">
      <h2 className="vat-details-header">VAT Information</h2>

      <div className="details-card">
        <h3>Company Information</h3>
        {renderDataRow('Company Name', data.taxcompanyname)}
        {renderDataRow('Tax Number', data.taxregnum)}
        {renderDataRow('Company Address', data.taxcompanyaddress)}

        <h3>Purchaser Information</h3>
        {renderDataRow('Purchaser Name', data.purchasername)}
        {renderDataRow('Email', data.email)}
        {renderDataRow('Phone', data.phone)}
        {renderDataRow('Customer Account', data.custaccount)}

        <h3>Invoice Details</h3>
        {renderDataRow('Invoice Number', data.invoicenum)}
        {renderDataRow('Invoice Date', data.invoicedate)}
        {renderDataRow('Form Format', data.formformat)}
        {renderDataRow('Form Number', data.formnum)}
        {renderDataRow('Serial Number', data.serialnum)}
        {renderDataRow('Tax Transaction Text', data.taxtranstxt)}
        {renderDataRow('Transaction Time', data.transtime)}

        <h3>System Information</h3>
        {renderDataRow('Combination', data.combination ? 'Yes' : 'No')}
        {renderDataRow('Customer Request', data.custrequest ? 'Yes' : 'No')}
        {renderDataRow('Cancel', data.cancel ? 'Yes' : 'No')}
        {renderDataRow('Retail Transaction Table', data.retailtransactiontable)}
        {renderDataRow('Retail Trans RecID Group', data.retailtransrecidgroup)}
        {renderDataRow('Data Area ID', data.dataareaid)}
        {renderDataRow('Record Version', data.recversion)}
        {renderDataRow('Partition', data.partition)}
        {renderDataRow('Record ID', data.recid)}
      </div>
    </div>
  );
};

export default VatDetails;