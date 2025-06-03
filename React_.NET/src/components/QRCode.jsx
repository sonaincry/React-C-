import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VatDetails.css';

const VatDetails = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recid, setRecid] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const recidFromUrl = queryParams.get('recid');

    if (recidFromUrl) {
      setRecid(recidFromUrl);
      setError('');
    } else {
      setError('RECID not found.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!recid) {
      if (!error) setLoading(false); 
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');    
      try {

        const response = await axios.get(`https://satramart.runasp.net/VATInformation/details?recid=${recid}`);

        setData(response.data);

      } catch (err) {

        setError(err.response?.data || 'Error fetching data');

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

    {loading && (
      <p className="loading-message">Loading VAT details...</p>
    )}

    {!loading && error && (
      <p className="error-message">Error: {error}</p>
    )}

    {!loading && !error && !data && (
      <p className="no-data-message">No data found for RECID: {recid}</p>
    )}

    {!loading && data && (
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
    )}
  </div>
);

};

export default VatDetails;