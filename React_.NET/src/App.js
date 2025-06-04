import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import LoginPage from './components/LoginPage';
import VatDetails from './components/QRCode'; 

function App() {
 return (
    <Router>
      <div className="App">
        <Routes>
          {/* Homepage - Tax Register Page */}
          <Route path="/" element={<RegistrationForm />} />
          
          {/* VAT Details Page for QR Code */}
          <Route path="/vat-details" element={<VatDetails />} />
          
          {/* Optional: 404 page */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 