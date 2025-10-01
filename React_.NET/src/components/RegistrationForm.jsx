import React, { useState, useEffect } from 'react';
import './RegistrationForm.css';
import logo from './logo.png';

function RegistrationForm() {
    const [companyName, setCompanyName] = useState('');
    const [companyTaxNumber, setCompanyTaxNumber] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [cccd, setCccd] = useState('');
    const [maqhns, setMaqhns] = useState('');

    const [emailError, setEmailError] = useState('');
    const [taxError, setTaxError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [notification, setNotification] = useState('');
    const [cccdError, setCccdError] = useState('');

    const [formKey, setFormKey] = useState(0);
    const [receiptParams, setReceiptParams] = useState(null);

    const HMAC_SECRET = "LdL3hgtuCk8MxiMN/Sc7xBfQdFnlp5o8GMxFPB5NIkA=";

    useEffect(() => {
        // Get the raw query string
        const queryString = window.location.search;
        console.log("Raw query string:", queryString);

        // Parse query parameters
        const queryParams = new URLSearchParams(queryString);
        const receiptid = queryParams.get('receiptid');
        const date = queryParams.get('date');
        const dataareaid = queryParams.get('dataareaid');
        const storeno = queryParams.get('storeno');

        // Extract sign from raw query string to preserve special characters
        let sign = null;
        const signMatch = queryString.match(/[?&]sign=([^&]*)/);
        if (signMatch) {
            sign = signMatch[1];
            console.log("Raw sign from query string:", sign);
        }

        if (!receiptid || !date || !dataareaid || !storeno || !sign) {
            setNotification("Error: Missing required URL parameters.");
            return;
        }

        setReceiptParams({ receiptid, date, dataareaid, storeno, sign });
        console.log('Receipt params set successfully:', { receiptid, date, dataareaid, storeno, sign });
    }, []);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateTaxNumber = (value) => /^\d+$/.test(value);
    const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);
    const validateCCCD = (value) => /^\d{12}$/.test(value);
    const handleEmailChange = (e) => setCustomerEmail(e.target.value);
    const handleTaxNumberChange = (e) => setCompanyTaxNumber(e.target.value);
    const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification('');

        if (!receiptParams) {
            setNotification('Error: Missing receipt parameters.');
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

        try {
            setNotification('Saving...');

            const signature = receiptParams.sign;
            const rawData = `${receiptParams.receiptid}${receiptParams.dataareaid}${receiptParams.storeno}${receiptParams.date}`.toLowerCase();
            console.log("Raw sign:", signature);
            console.log("Encoded sign:", encodeURIComponent(signature));
            console.log("Frontend rawData:", rawData);

            const apiUrl = `https://10.0.83.4/VATInformation/receipt?receiptid=${encodeURIComponent(receiptParams.receiptid)}&dataareaid=${encodeURIComponent(receiptParams.dataareaid)}&storeno=${encodeURIComponent(receiptParams.storeno)}&date=${encodeURIComponent(receiptParams.date)}&sign=${encodeURIComponent(signature)}`;
            console.log("Final API URL:", apiUrl);

            const payload = {
                TAXREGNUM: companyTaxNumber,
                TAXCOMPANYNAME: companyName,
                TAXCOMPANYADDRESS: companyAddress,
                PURCHASERNAME: customerName,
                EMAIL: customerEmail || "",
                PHONE: phoneNumber || "",
                CCCD: cccd || "",
                MAQHNS: maqhns || "",
                INVOICEDATE: receiptParams.date,
                DATAAREAID: receiptParams.dataareaid,
                RETAILRECEIPTID: receiptParams.receiptid,
                RETAILSTOREID: receiptParams.storeno
            };

            console.log("Payload:", payload);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setNotification('Save successful! Your information has been submitted.');
                setCompanyName("");
                setCompanyTaxNumber("");
                setCompanyAddress("");
                setCustomerName("");
                setPhoneNumber("");
                setCustomerEmail("");
                setCccd("");
                setMaqhns("");
            } else if (response.status === 401) {
                const errorText = await response.text();
                console.error('401 Error response:', errorText);
                setNotification('Error: Invalid signature. Authentication failed.');
            } else if (response.status === 409) {
                setNotification('Receipt already updated VAT information.');
            } else if (response.status === 400) {
                setNotification('Invalid input data.');
            } else {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                setNotification(`Failed to save. Status: ${response.status}`);
            }
        } catch (error) {
            setNotification('Error: Server not reachable.');
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