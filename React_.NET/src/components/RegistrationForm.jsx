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

  const handleSubmit = (e) => {
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

    console.log('Form submitted');
  };


  return (
    <div className="registration-container">
      <h2>THÔNG TIN THUẾ CÁ NHÂN</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>

        <div className="form-columns">
          <div className="form-column">
            <label>Company Name</label>
            <input type="text" placeholder="Enter company name" />

            <label>Company Tax Number</label>
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

            <label>Company Address</label>
            <input type="text" placeholder="Enter address" />
          </div>

          <div className="form-column">
            <label>Customer Name</label>
            <input type="text" placeholder="Enter customer name" />

            <label>Phone Number</label>
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

            <label>Customer Email</label>
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

            <label>Customer Address</label>
            <input type="text" placeholder="Enter customer address" />
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" className="back-button">Back</button>
          <button type="submit" className="register-button">Register</button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationForm;