import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/success.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-success-wrapper">
      <div className="success-modal">
        <div className="success-logo-outer">
          <div className="success-logo-inner" style={{ background: '#64748b' }}>
            <svg viewBox="0 0 100 100" className="success-svg-logo" xmlns="http://www.w3.org/2000/svg">
              <text 
                x="50%" 
                y="70%" 
                textAnchor="middle" 
                fill="white" 
                fontSize="60" 
                fontWeight="900" 
                fontFamily="Arial, sans-serif"
              >
                ?
              </text>
            </svg>
          </div>
        </div>
        
        <div className="success-content">
          <h1 className="success-title">Page Not Found</h1>
          <p className="success-description">
            The page you are looking for doesn't exist or is not accessible directly.
          </p>
          <button 
            onClick={() => navigate('/checkout')}
            className="success-link-button"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
