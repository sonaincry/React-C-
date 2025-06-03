import React, { useState } from 'react';
import './RegistrationForm.css';
import logo from './logo.png';

function RegistrationForm() {
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [companyTaxNumber, setCompanyTaxNumber] = useState('');
  const [taxError, setTaxError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notification, setNotification] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateTaxNumber = (value) => {
    return /^\d+$/.test(value);
  };

  const validatePhoneNumber = (phone) => {
    return /^0\d{9}$/.test(phone);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCustomerEmail(value);
    setEmailError('');
  };

  const handleEmailBlur = (e) => {
    const value = e.target.value;
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email.');
    } else {
      setEmailError('');
    }
  };

  const handleTaxNumberChange = (e) => {
    setCompanyTaxNumber(e.target.value);
    setTaxError('');
  };

  const handleTaxNumberBlur = () => {
    if (!companyTaxNumber) {
      setTaxError('Company tax number is required.');
    } else if (!validateTaxNumber(companyTaxNumber)) {
      setTaxError('Only numbers are allowed.');
    } else {
      setTaxError('');
    }
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
    setPhoneError('');
  };

  const handlePhoneBlur = () => {
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneError('Phone must be 10 digits and start with 0.');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  let valid = true;

  if (!companyTaxNumber) {
    setTaxError('Company tax number is required.');
    valid = false;
  } else if (!validateTaxNumber(companyTaxNumber)) {
    setTaxError('Only numbers are allowed.');
    valid = false;
  }

  if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
    setPhoneError('Phone must be 10 digits and start with 0.');
    valid = false;
  }

  if (customerEmail && !validateEmail(customerEmail)) {
    setEmailError('Please enter a valid email address.');
    valid = false;
  }

  if (!valid) return;

  const payload = {
  combination: true,
  custrequest: true,
  formformat: "string",
  formnum: "string",
  invoicedate: "string",
  invoicenum: 0,
  purchasername: customerName,
  retailtransactiontable: 0,
  retailtransrecidgroup: 0,
  serialnum: "string",
  taxcompanyaddress: companyAddress,
  taxcompanyname: companyName,
  taxregnum: companyTaxNumber,
  taxtranstxt: "string",
  transtime: 0,
  dataareaid: "string",
  recversion: 0,
  partition: 0,
  recid: 0,
  email: customerEmail || "",
  phone: phoneNumber || "",
  custaccount: "",
  cancel: true,
};


  try {
    const response = await fetch('https://satramart.runasp.net/VATInformation/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to save');
    }

    const data = await response.json();
    setNotification('Registration successful! Your information has been saved.');
    console.log('Saved successfully', data);

  } catch (error) {
     setNotification('Error: Failed to save your information.');
    console.error('Error saving form:', error);
  }
};

  return (
    <div className="registration-container">
      <div className="header-row">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>
        <h2 className="form-heading">THÔNG TIN XUẤT HÓA ĐƠN</h2>
      </div>
      <form className="registration-form" onSubmit={handleSubmit}>

        <div></div>
        <div></div>
        <div className="form-columns">
          <div className="form-column">
            <label>Tên Công Ty</label>
            <input
              type="text"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label>Mã Số Thuế</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder={taxError ? "" : "Enter tax number"}
                value={companyTaxNumber}
                onChange={handleTaxNumberChange}
                onBlur={handleTaxNumberBlur}
                className={taxError ? "input-error" : ""}
              />
              {taxError && <span className="error-inside">{taxError}</span>}
            </div>

            <label>Địa Chỉ Công Ty</label>
            <input
              type="text"
              placeholder="Enter company address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </div>

          <div className="form-column">
            <label>Người Mua Hàng</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <label>Số Điện Thoại</label>
            <div className="input-wrapper">
              <input
                type="tel"
                placeholder={phoneError ? "" : "Enter phone number"}
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                className={phoneError ? "input-error" : ""}
              />
              {phoneError && <span className="error-inside">{phoneError}</span>}
            </div>
            <label>Email</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder={emailError ? "" : "Enter customer email"}
                value={customerEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={emailError ? "input-error" : ""}
              />
              {emailError && <span className="error-inside">{emailError}</span>}
            </div>


          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="register-button">Đăng ký</button>
        </div>
        {notification && (
          <div className="notification" style={{ marginTop: '20px', textAlign: 'center', color: notification.includes('Error') ? 'red' : 'green' }}>
            {notification}
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistrationForm;