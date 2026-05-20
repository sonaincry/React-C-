import React, { useState, useEffect } from "react";
import "./RegistrationForm.css";
import logo from "./logo.png";

function RegistrationForm() {
  const [companyName, setCompanyName] = useState("");
  const [companyTaxNumber, setCompanyTaxNumber] = useState("");
  const [noTaxCode, setNoTaxCode] = useState(false);
  const [companyAddress, setCompanyAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [cccd, setCccd] = useState("");
  const [maqhns, setMaqhns] = useState("");
  const [companyAddressError, setCompanyAddressError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [taxError, setTaxError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [notification, setNotification] = useState("");
  const [cccdError, setCccdError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");

  const [formKey, setFormKey] = useState(0);
  const [receiptParams, setReceiptParams] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [receiptId, setReceiptId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [storeName, setStoreName] = useState(null);

  const [isPreview, setIsPreview] = useState(false);
  const [notificationType, setNotificationType] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isBillNotReady, setIsBillNotReady] = useState(false);

  const HMAC_SECRET = "LdL3hgtuCk8MxiMN/Sc7xBfQdFnlp5o8GMxFPB5NIkA=";

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
        setNotificationType("error");
      });
  }, []);

  useEffect(() => {
    if (!isConfigLoaded || !apiBaseUrl || !receiptParams?.receiptid) return;

    const controller = new AbortController();
    const signal = controller.signal;

    setIsLoading(true);

    const url =
      `${apiBaseUrl.replace(/\/$/, "")}/VATInformation/transaction-info/${encodeURIComponent(receiptParams.receiptid)}` +
      `?dataareaid=${encodeURIComponent(receiptParams.dataareaid)}` +
      `&storeno=${encodeURIComponent(receiptParams.storeno)}` +
      `&date=${encodeURIComponent(receiptParams.date)}` +
      `&sign=${encodeURIComponent(receiptParams.sign)}`;

    console.log("Fetching transaction info with signature verification:", url);

    fetch(url, { signal })
      .then((res) => {
        if (res.status === 404) throw { status: 404 };
        if (!res.ok) throw { status: res.status };
        return res.json();
      })
      .then((data) => {
        console.log("Transaction info loaded:", data);
        setReceiptId(data.receiptId || receiptParams.receiptid);
        if (data.storeName) setStoreName(data.storeName);
        if (data.paymentAmount !== undefined) setPaymentAmount(data.paymentAmount);
      })
      .catch((err) => {
        if (signal.aborted) return;
        console.error("Fetch error:", err);
        if (err.status === 404) {
          setIsBillNotReady(true);
          setNotification("Bill chưa đồng bộ về hệ thống! Vui lòng quay lại sau 15 phút.");
          setNotificationType("warning");
        } else {
          setNotification("Link hóa đơn không hợp lệ hoặc đã bị chỉnh sửa.");
          setNotificationType("error");
        }
      })
      .finally(() => {
        if (!signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
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
      setNotificationType("error");
      return;
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (date !== todayStr) {
      setIsExpired(true);
      return;
    }

    setReceiptParams({ receiptid, date, dataareaid, storeno, sign });
    console.log("Receipt params set successfully:", { receiptid, date, dataareaid, storeno, sign });
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateTaxNumber = (value) => /^(\d{10}|\d{12}|\d{10}-\d{3})$/.test(value);
  const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);
  const validateCCCD = (value) => /^\d{12}$/.test(value);
  const handleEmailChange = (e) => setCustomerEmail(e.target.value);
  const handleTaxNumberChange = (e) => setCompanyTaxNumber(e.target.value);
  const handlePhoneChange = (e) => setPhoneNumber(e.target.value);

  const validateForm = (currentNoTaxCode = noTaxCode) => {
    let valid = true;

    if (!companyAddress || companyAddress.trim() === "") {
      setCompanyAddressError("Vui lòng nhập Địa chỉ đơn vị.");
      valid = false;
    } else {
      setCompanyAddressError("");
    }

    if (!companyName || companyName.trim() === "") {
      setCompanyNameError("Vui lòng nhập Tên đơn vị.");
      valid = false;
    } else {
      setCompanyNameError("");
    }

    if (!currentNoTaxCode) {
      if (!companyTaxNumber || !validateTaxNumber(companyTaxNumber)) {
        setTaxError("Mã số thuế phải là 10 hoặc 12 chữ số, hoặc định dạng 10-xxx.");
        valid = false;
      } else {
        setTaxError("");
      }
    } else {
      setTaxError("");
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneError("SĐT phải là 10 chữ số và bắt đầu bằng 0.");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!customerEmail || customerEmail.trim() === "") {
      setEmailError("Vui lòng nhập Email.");
      valid = false;
    } else if (!validateEmail(customerEmail)) {
      setEmailError("Vui lòng nhập đúng định dạng email.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (cccd && !validateCCCD(cccd)) {
      setCccdError("CCCD phải là 12 chữ số.");
      valid = false;
    } else {
      setCccdError("");
    }

    return valid;
  };

  const handlePreview = () => {
    setNotification("");
    setNotificationType("");
    if (!isConfigLoaded) { setNotification("Error: Chưa load config."); setNotificationType("error"); return; }
    if (!receiptParams) { setNotification("Error: receipt thiếu các trường quy định."); setNotificationType("error"); return; }
    if (validateForm(noTaxCode)) setIsPreview(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setNotification("");
    setNotificationType("");

    if (!isConfigLoaded) { setNotification("Error: Chưa load config."); setNotificationType("error"); return; }
    if (!receiptParams) { setNotification("Error: receipt thiếu các trường quy định."); setNotificationType("error"); return; }
    if (!validateForm(noTaxCode)) return;

    try {
      setNotification("Saving...");

      const apiUrl =
        `${apiBaseUrl}/VATInformation/receipt` +
        `?receiptid=${encodeURIComponent(receiptParams.receiptid)}` +
        `&dataareaid=${encodeURIComponent(receiptParams.dataareaid)}` +
        `&storeno=${encodeURIComponent(receiptParams.storeno)}` +
        `&date=${encodeURIComponent(receiptParams.date)}` +
        `&sign=${encodeURIComponent(receiptParams.sign)}`;

      const payload = {
        TAXREGNUM: noTaxCode ? "" : companyTaxNumber,
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

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNotification("Cập nhật thông tin xuất hóa đơn thành công");
        setNotificationType("success");
        setIsSubmitted(true);
      } else if (response.status === 409) {
        setNotification("Lỗi nhập thông tin hóa đơn! Hóa đơn này đã đăng ký xuất hóa đơn.");
        setNotificationType("error");
      } else if (response.status === 400) {
        setNotification("Lỗi nhập thông tin hóa đơn! Thông tin không hợp lệ.");
        setNotificationType("error");
      } else if (response.status === 401) {
        setNotification("Lỗi xác thực. Secret key không đúng.");
        setNotificationType("error");
      } else {
        setNotification(`Lưu thất bại. Status: ${response.status}`);
        setNotificationType("error");
      }
    } catch (error) {
      setNotification("Error: Không kết nối được server.");
      setNotificationType("error");
      console.error("Lưu thất bại:", error);
    }
  };

  if (isLoading && receiptParams) {
    return (
      <div className="registration-container">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <img src={logo} alt="Company Logo" className="logo" />
          <p style={{ marginTop: "20px", fontSize: "16px" }}>Đang tải thông tin hóa đơn...</p>
        </div>
      </div>
    );
  }

  const renderNotification = () => {
    if (!notification) return null;
    return (
      <div
        className={`preview-note ${notificationType === "error" ? "note-error"
            : notificationType === "success" ? "note-success"
              : notificationType === "warning" ? "note-warning"
                : ""
          }`}
      >
        {notification}
        {isBillNotReady && (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: "12px",
              padding: "4px 14px",
              backgroundColor: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        )}
      </div>
    );
  };

  const disabledFieldset = {
    opacity: 0.5,
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <div className="registration-container" key={formKey}>
      <div className="header-row">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>
        <h2 className="form-heading">THÔNG TIN XUẤT HÓA ĐƠN</h2>
      </div>

      {isExpired ? (
        <div className="preview-note note-error" style={{ marginTop: "20px", fontSize: "15px" }}>
          Quá thời hạn yêu cầu xuất hóa đơn. Phiếu bán hàng chỉ có giá trị yêu cầu xuất hóa đơn trong ngày
        </div>
      ) : (
        <>
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
              {renderNotification()}

              <div style={isBillNotReady ? disabledFieldset : {}}>
                <label className="no-tax-checkbox">
                  <input
                    type="checkbox"
                    checked={noTaxCode}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNoTaxCode(checked);
                      if (checked) { setCompanyTaxNumber(""); setTaxError(""); }
                    }}
                  />
                  Đơn vị không có Mã số thuế (Công ty nước ngoài/Đơn vị nhà nước/Khách lẻ)
                </label>

                <div className="form-columns">
                  <div className="form-column">
                    <label>Tên Đơn Vị <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder={companyNameError ? "" : "Enter company name"}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={companyNameError ? "input-error" : ""}
                      />
                      {companyNameError && <span className="error-inside">{companyNameError}</span>}
                    </div>

                    <div className="tax-label-row">
                      <label>Mã Số Thuế {!noTaxCode && <span className="required">*</span>}</label>
                    </div>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder={taxError ? "" : "Enter tax number"}
                        value={companyTaxNumber}
                        onChange={handleTaxNumberChange}
                        disabled={noTaxCode}
                        className={taxError && !noTaxCode ? "input-error" : ""}
                      />
                      {taxError && !noTaxCode && <span className="error-inside">{taxError}</span>}
                    </div>

                    <label>Địa Chỉ Đơn Vị <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder={companyAddressError ? "" : "Enter company address"}
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className={companyAddressError ? "input-error" : ""}
                      />
                      {companyAddressError && (
                        <span className="error-inside">{companyAddressError}</span>
                      )}
                    </div>

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
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="register-button"
                  disabled={isBillNotReady}
                  style={isBillNotReady ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  Xem trước
                </button>
              </div>
            </form>
          ) : (
            <div className="preview-form">
              {notification
                ? renderNotification()
                : (
                  <div className="preview-note">
                    Vui lòng kiểm tra lại thông tin xuất hóa đơn chính xác trước khi bấm xác nhận.
                  </div>
                )
              }

              <div className="form-columns">
                <div className="form-column">
                  <label>Tên Đơn Vị</label>
                  <div className="preview-value">{companyName || "--"}</div>
                  <label>Mã Số Thuế</label>
                  <div className="preview-value">
                    {noTaxCode ? "Không có mã số thuế" : companyTaxNumber || "--"}
                  </div>
                  <label>Địa Chỉ Đơn Vị</label>
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

              {!isSubmitted && (
                <div className="form-buttons preview-buttons">
                  <button type="button" onClick={() => setIsPreview(false)} className="cancel-button">
                    Hủy
                  </button>
                  <button type="button" onClick={handleSubmit} className="register-button">
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RegistrationForm;