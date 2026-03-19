import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/success.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-wrapper">
      <div className="success-modal">
        <div className="success-logo-outer">
          <div className="success-logo-inner">
            <svg viewBox="0 0 100 100" className="success-svg-logo" xmlns="http://www.w3.org/2000/svg">
              <text 
                x="45%" 
                y="68%" 
                textAnchor="middle" 
                fill="white" 
                fontSize="70" 
                fontWeight="900" 
                fontFamily="'Inter', -apple-system, sans-serif"
                style={{ letterSpacing: '-2px' }}
              >
                S
              </text>
              <circle cx="68" cy="40" r="5" fill="white" />
            </svg>
          </div>
        </div>
        
        <div className="success-content">
          <h1 className="success-title">Payment Successful!</h1>
          <p className="success-description">
            Your payment has been processed. We have emailed you a receipt.
          </p>
        </div>
      </div>
    </div>
  );
};


export default PaymentSuccess;

