import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // Navigate back to checkout - you might want to preserve the session_id
    navigate(-1);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="checkout-container">
      <div className="result-container">
        <div className="failed-icon">✕</div>
        <h1>Payment Failed</h1>
        <p>Payment Failed. Please try again.</p>
        <div className="button-group">
          <button 
            className="retry-button" 
            onClick={handleTryAgain}
          >
            Try Again
          </button>
          <button 
            className="return-button" 
            onClick={handleReturnHome}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
