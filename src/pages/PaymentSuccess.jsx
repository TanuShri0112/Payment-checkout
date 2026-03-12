import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="checkout-container">
      <div className="result-container">
        <div className="success-icon">✓</div>
        <h1>Payment Successful</h1>
        <p>Thank you for your purchase!</p>
        <button 
          className="return-button" 
          onClick={handleReturnHome}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
