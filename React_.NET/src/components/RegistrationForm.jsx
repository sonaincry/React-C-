import React from 'react';
import './RegistrationForm.css';

function RegistrationForm() {
  return (
    <div className="registration-container">
      <h2>THÔNG TIN THUẾ CÁ NHÂN</h2>
      <form className="registration-form">

        <div className="form-columns">
          <div className="form-column">
            <label>Company Logo</label>
            <input type="file" accept="image/*" />

            <label>Company Name</label>
            <input type="text" placeholder="Enter company name" />

            <label>Company Tax Number</label>
            <input type="text" placeholder="Enter tax number" />

            <label>Company Address</label>
            <input type="text" placeholder="Enter address" />
          </div>

          <div className="form-column">
            <label>Customer Name</label>
            <input type="text" placeholder="Enter customer name" />

            <label>Phone Number</label>
            <input type="tel" placeholder="Enter phone number" />

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
