import React, { useState, useEffect } from "react";
import "./RegistrationForm.css";
import logo from "./logo.png";

function RegistrationForm() {
  const [companyName, setCompanyName] = useState("");
  const [companyTaxNumber, setCompanyTaxNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cccd, setCccd] = useState("");
  const [maqhns, setMaqhns] = useState("");

  const [emailError, setEmailError] = useState("");
  const [taxError, setTaxError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [notification, setNotification] = useState("");
  const [cccdError, setCccdError] = useState("");

  const [formKey, setFormKey] = useState(0);
  const [receiptParams, setReceiptParams] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [receiptId, setReceiptId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [storeName, setStoreName] = useState(null);

  const [isPreview, setIsPreview] = useState(false);

  const HMAC_SECRET = "LdL3hgtuCk8MxiMN/Sc7xBfQdFnlp5o8GMxFPB5NIkA=";

  // Load config.json once when the app starts
  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((config) => {
        console.log("Loaded config:", config);
        setApiBaseUrl(config.API_BASE_URL);
        setIsConfigLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load config.json:", err);
        setNotification("Error: Could not load configuration file.");
      });
  }, []);

  useEffect(() => {
  if (!isConfigLoaded || !apiBaseUrl || !receiptParams?.receiptid) return;

  const controller = new AbortController();
  const signal = controller.signal;

  setIsLoading(true);

  const url = `${apiBaseUrl.replace(/\/$/, "")}/VATInformation/transaction-info/${receiptParams.receiptid}`;

  fetch(url, { signal })
    .then(res => {
      if (!res.ok) throw new Error("Transaction not found");
      return res.json();
    })
    .then(data => {
      console.log("Transaction info loaded:", data); // 🔥 IMPORTANT LOG
      setReceiptId(data.receiptId);
      setPaymentAmount(data.paymentAmount);
      setStoreName(data.storeName);
    })
    .catch(err => {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
        setReceiptId(null);
        setPaymentAmount(null);
        setStoreName(null);
      }
    })
    .finally(() => {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    });

  return () => {
    controller.abort();
  };

}, [isConfigLoaded, apiBaseUrl, receiptParams?.receiptid]);

  useEffect(() => {
    const queryString = window.location.search;
    console.log("Raw query string:", queryString);

    const queryParams = new URLSearchParams(queryString);
    const receiptid = queryParams.get("receiptid");
    const date = queryParams.get("date");
    const dataareaid = queryParams.get("dataareaid");
    const storeno = queryParams.get("storeno");

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
    console.log("Receipt params set successfully:", {
      receiptid,
      date,
      dataareaid,
      storeno,
      sign,
    });
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateTaxNumber = (value) => /^\d+$/.test(value);
  const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);
  const validateCCCD = (value) => /^\d{12}$/.test(value);
  const handleEmailChange = (e) => setCustomerEmail(e.target.value);
  const handleTaxNumberChange = (e) => setCompanyTaxNumber(e.target.value);
  const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

  const validateForm = () => {
    let valid = true;
    if (!companyTaxNumber || !validateTaxNumber(companyTaxNumber)) {
      setTaxError("Tax number is required and must be numeric.");
      valid = false;
    } else {
      setTaxError("");
    }
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneError("Phone must be 10 digits and start with 0.");
      valid = false;
    } else {
      setPhoneError("");
    }
    if (customerEmail && !validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (cccd && !validateCCCD(cccd)) {
      setCccdError("CCCD must be exactly 12 digits.");
      valid = false;
    } else {
      setCccdError("");
    }
    return valid;
  };

  const handlePreview = () => {
    setNotification("");
    if (!isConfigLoaded) {
      setNotification("Error: Configuration not loaded yet.");
      return;
    }
    if (!receiptParams) {
      setNotification("Error: Missing receipt parameters.");
      return;
    }
    if (validateForm()) {
      setIsPreview(true);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setNotification("");

    if (!isConfigLoaded) {
      setNotification("Error: Configuration not loaded yet.");
      return;
    }

    if (!receiptParams) {
      setNotification("Error: Missing receipt parameters.");
      return;
    }

    if (!validateForm()) return;

    try {
      setNotification("Saving...");

      const signature = receiptParams.sign;
      const apiUrl = `${apiBaseUrl}/VATInformation/receipt?receiptid=${encodeURIComponent(
        receiptParams.receiptid
      )}&dataareaid=${encodeURIComponent(
        receiptParams.dataareaid
      )}&storeno=${encodeURIComponent(
        receiptParams.storeno
      )}&date=${encodeURIComponent(
        receiptParams.date
      )}&sign=${encodeURIComponent(signature)}`;
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
        RETAILSTOREID: receiptParams.storeno,
      };

      console.log("Payload:", payload);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNotification(
          "Save successful! Your information has been submitted."
        );
        setCompanyName("");
        setCompanyTaxNumber("");
        setCompanyAddress("");
        setCustomerName("");
        setPhoneNumber("");
        setCustomerEmail("");
        setCccd("");
        setMaqhns("");
        setIsPreview(false);
      } else if (response.status === 401) {
        const errorText = await response.text();
        console.error("401 Error response:", errorText);
        setNotification("Error: Invalid signature. Authentication failed.");
      } else if (response.status === 409) {
        setNotification("Receipt already updated VAT information.");
      } else if (response.status === 400) {
        setNotification("Invalid input data.");
      } else {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        setNotification(`Failed to save. Status: ${response.status}`);
      }
    } catch (error) {
      setNotification("Error: Server not reachable.");
      console.error("Error saving form:", error);
    }
  };

  if (isLoading && receiptParams) {
    return (
      <div className="registration-container">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <img src={logo} alt="Company Logo" className="logo" />
          <p style={{ marginTop: "20px", fontSize: "16px" }}>
            Đang tải thông tin hóa đơn...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-container" key={formKey}>
      <div className="header-row">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>
        <h2 className="form-heading">THÔNG TIN XUẤT HÓA ĐƠN</h2>
      </div>
      {receiptId && (
          <div className="transaction-summary">
            <div className="transaction-item">
              <span className="label">{storeName}</span>
            </div>
            <div className="transaction-item">
              <span className="label">Số Bill</span>
              <span className="value">{receiptId}</span>
            </div>
            <div className="transaction-item">
              <span className="label">Tổng tiền thanh toán</span>
              <span className="value amount">
                {Number(paymentAmount).toLocaleString("vi-VN")} ₫
              </span>
            </div>
          </div>
        )}
      {!isPreview ? (
        <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
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
            <button type="button" onClick={handlePreview} className="register-button">
              Xem trước
            </button>
          </div>
        </form>
      ) : (
        <div className="preview-form">
          <p className="preview-note">Vui lòng kiểm tra lại thông tin xuất hóa đơn chính xác trước khi bấm xác nhận.</p>
          <div className="form-columns">
            <div className="form-column">
              <label>Tên Công Ty</label>
              <div className="preview-value">{companyName || "--"}</div>

              <label>Mã Số Thuế</label>
              <div className="preview-value">{companyTaxNumber || "--"}</div>

              <label>Địa Chỉ Công Ty</label>
              <div className="preview-value">{companyAddress || "--"}</div>
              <label>Mã QHNS</label>
              <div className="preview-value">{maqhns || "--"}</div>
            </div>

            <div className="form-column">
              <label>Người Mua Hàng</label>
              <div className="preview-value">{customerName || "--"}</div>
              <label>Số Điện Thoại</label>
              <div className="preview-value">{phoneNumber || "--"}</div>
              <label>Email</label>
              <div className="preview-value">{customerEmail || "--"}</div>
              <label>CCCD</label>
              <div className="preview-value">{cccd || "--"}</div>
            </div>
          </div>

          <div className="form-buttons preview-buttons">
            <button type="button" onClick={() => setIsPreview(false)} className="cancel-button">
              Hủy
            </button>
            <button type="button" onClick={handleSubmit} className="register-button">
              Đăng ký
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div
          className="notification"
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: notification.includes("Error") ? "red" : "green",
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
}

export default RegistrationForm;