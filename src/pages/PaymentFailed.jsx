import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/success.css';

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate(-1);
  };

  return (
    <div className="payment-success-wrapper payment-failure-wrapper">
      <div className="success-modal">
        <div className="success-logo-outer">
          <div className="success-logo-inner failure-logo-inner">
            <svg viewBox="0 0 100 100" className="success-svg-logo" xmlns="http://www.w3.org/2000/svg">
              <text 
                x="50%" 
                y="72%" 
                textAnchor="middle" 
                fill="white" 
                fontSize="65" 
                fontWeight="900" 
                fontFamily="Arial, sans-serif"
              >
                X
              </text>
            </svg>
          </div>
        </div>
        
        <div className="success-content">
          <h1 className="success-title">Payment Failed!</h1>
          <p className="success-description">
            The transaction could not be completed. Please check your card details and try again.
          </p>
          <button 
            onClick={handleTryAgain}
            className="success-link-button try-again-button"
          >
            Try Payment Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;

