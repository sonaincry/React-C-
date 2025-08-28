import React, { useState, useEffect } from 'react';
import './RegistrationForm.css';
import logo from './logo.png';

function RegistrationForm() {
    // State for the form fields
    const [companyName, setCompanyName] = useState('');
    const [companyTaxNumber, setCompanyTaxNumber] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [cccd, setCccd] = useState('');
    const [maqhns, setMaqhns] = useState('');

    // State for validation and notifications
    const [emailError, setEmailError] = useState('');
    const [taxError, setTaxError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [notification, setNotification] = useState('');
    const [cccdError, setCccdError] = useState('');

    // State to hold the recid, starting as null
    const [receiptId, setReceiptId] = useState(null);

    // --- NEW: A key to force the form to re-render ---
    const [formKey, setFormKey] = useState(0);

    // This block runs once when the component first loads to get the recid from the URL
    useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const receiptIdFromUrl = queryParams.get('receiptid'); // <-- lowercase matches your URL

    if (receiptIdFromUrl) {
        setReceiptId(receiptIdFromUrl);
    } else {
        setNotification('Error: ReceiptID is missing from URL.');
    }
}, [formKey]);


    // --- Validation Functions (no changes needed) ---
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateTaxNumber = (value) => /^\d+$/.test(value);
    const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);
    const validateCCCD = (value) => /^\d{12}$/.test(value);
    const handleEmailChange = (e) => setCustomerEmail(e.target.value);
    const handleTaxNumberChange = (e) => setCompanyTaxNumber(e.target.value);
    const handlePhoneChange = (e) => setPhoneNumber(e.target.value);
    
    // --- The submit handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification('');

        if (!receiptId) {
            setNotification('Error: Cannot submit without a valid ReceiptID.');
            return;
        }

        let valid = true;
        if (!companyTaxNumber || !validateTaxNumber(companyTaxNumber)) {
            setTaxError('Tax number is required and must be numeric.');
            valid = false;
        } else {
            setTaxError('');
        }
        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            setPhoneError('Phone must be 10 digits and start with 0.');
            valid = false;
        } else {
            setPhoneError('');
        }
        if (customerEmail && !validateEmail(customerEmail)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
            
        } else {
            setEmailError('');
        }
        if (cccd && !validateCCCD(cccd)) {
            setCccdError('CCCD must be exactly 12 digits.');
            valid = false;
        } else {
            setCccdError('');
        }
        if (!valid) return;

        const payload = {
            taxregnum: companyTaxNumber,
            taxcompanyname: companyName,
            taxcompanyaddress: companyAddress,
            purchasername: customerName,
            email: customerEmail || "",
            phone: phoneNumber || "",
            cccd: cccd || "",
            maqhns: maqhns || ""
        };

        try {
            setNotification('Saving...');
            const response = await fetch(`https://10.0.83.4/VATInformation/addv2/${encodeURIComponent(receiptId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            console.log('Fetch URL:', `https://10.0.83.4/VATInformation/addv2/${encodeURIComponent(receiptId)}`);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to save');
            }
            
            setNotification('Update successful! Your information has been saved.');
            
            setFormKey(prevKey => prevKey + 1);

        } catch (error) {
            setNotification(`Error: ${error.message}`);
            console.error('Error saving form:', error);
        }
    };

    return (
        <div className="registration-container" key={formKey}>
            <div className="header-row">
                <div className="logo-container">
                    <img src={logo} alt="Company Logo" className="logo" />
                </div>
                <h2 className="form-heading">THÔNG TIN XUẤT HÓA ĐƠN</h2>
            </div>
            <form className="registration-form" onSubmit={handleSubmit}>
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
                        <label>Mã QHNS</label>
                        <input
                            type="text"
                            placeholder="Enter MAQHNS"
                            value={maqhns}
                            onChange={(e) => setMaqhns(e.target.value)}
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
                                className={emailError ? "input-error" : ""}
                            />
                            {emailError && <span className="error-inside">{emailError}</span>}
                        </div>
                        <label>CCCD</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder={cccdError ? "" : "Enter 12-digit CCCD"}
                                value={cccd}
                                onChange={(e) => setCccd(e.target.value)}
                                className={cccdError ? "input-error" : ""}
                            />
                            {cccdError && <span className="error-inside">{cccdError}</span>}
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
