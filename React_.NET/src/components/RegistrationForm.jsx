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

    const [receiptId, setReceiptId] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const [receiptParams, setReceiptParams] = useState(null);

    // HMAC Secret Key (same as in your backend)
    const HMAC_SECRET = "LdL3hgtuCk8MxiMN/Sc7xBfQdFnlp5o8GMxFPB5NIkA=";

    // HMAC signature generation function
    const generateHMACSignature = async (secretKey, data) => {
        try {
            // Convert base64 secret key to bytes
            const keyBuffer = Uint8Array.from(atob(secretKey), c => c.charCodeAt(0));
            
            // Import the key
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            
            // Convert data to bytes
            const dataBuffer = new TextEncoder().encode(data);
            
            // Generate signature
            const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
            
            // Convert to hex string (lowercase)
            const hashArray = Array.from(new Uint8Array(signature));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex.toLowerCase();
        } catch (error) {
            console.error('Error generating HMAC signature:', error);
            return null;
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const receiptid = queryParams.get('receiptid');
        const date = queryParams.get('date');
        const dataareaid = queryParams.get('dataareaid');
        const storeno = queryParams.get('storeno');
        const sign = queryParams.get('sign');

        if (!receiptid || !date || !dataareaid || !storeno || !sign) {
            setNotification("Error: Missing required URL parameters.");
            return;
        }

        const fetchRecid = async () => {
            try {
                const res = await fetch(`https://10.0.83.4/VATInformation/get-recid?receiptId=${receiptid}`);
                if (!res.ok) {
                    setNotification("Error: Failed to fetch recid from server.");
                    return;
                }
                const recidData = await res.json();
                const recid = recidData;

                setReceiptId(receiptid);
                setReceiptParams({ receiptid, date, recid, dataareaid, storeno, sign });
            } catch (err) {
                console.error("Error fetching recid:", err);
                setNotification("Error: Could not connect to server.");
            }
        };

        fetchRecid();
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

        if (!receiptParams || !receiptParams.recid) {
            setNotification('Error: Cannot submit without a valid recid.');
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
            setNotification('Generating signature and saving...');

            // Generate HMAC signature
            const rawData = `${receiptParams.receiptid}${receiptParams.dataareaid}${receiptParams.storeno}${receiptParams.date}`.toLowerCase();
            console.log('Raw data for signature:', rawData);
            
            const signature = await generateHMACSignature(HMAC_SECRET, rawData);
            if (!signature) {
                setNotification('Error: Failed to generate signature.');
                return;
            }
            
            console.log('Generated signature:', signature);

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
                RETAILTRANSACTIONTABLE: receiptParams.recid,
                DATAAREAID: receiptParams.dataareaid
            };

            const apiUrl = `https://10.0.83.4/VATInformation/receipt?receiptid=${receiptParams.receiptid}&dataareaid=${receiptParams.dataareaid}&storeno=${receiptParams.storeno}&date=${receiptParams.date}&sign=${signature}`;
            
            console.log("Final API URL:", apiUrl);
            console.log("Payload:", payload);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setNotification('Save successful! Your information has been submitted.');
                // Clear form
                setCompanyName("");
                setCompanyTaxNumber("");
                setCompanyAddress("");
                setCustomerName("");
                setPhoneNumber("");
                setCustomerEmail("");
                setCccd("");
                setMaqhns("");
            } else if (response.status === 401) {
                setNotification('Error: Invalid signature. Authentication failed.');
            } else if (response.status === 409) {
                setNotification('Error: A record with this RetailTransactionTable already exists.');
            } else if (response.status === 400) {
                setNotification('Error: Invalid input data.');
            } else {
                const errorResponse = await response.text();
                console.error('Server response:', errorResponse);
                setNotification(`Error: Failed to save. Status: ${response.status}`);
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