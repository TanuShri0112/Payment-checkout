import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/success.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [isValidAccess, setIsValidAccess] = useState(false);

  useEffect(() => {
    // Check if user came from a valid payment flow
    const hasValidPaymentFlow = sessionStorage.getItem('payment_attempt_completed') === 'true';
    const hasRecentOrder = sessionStorage.getItem('last_order_id');
    
    if (!hasValidPaymentFlow || !hasRecentOrder) {
      // Redirect to checkout if access is invalid
      navigate('/checkout', { replace: true });
      return;
    }
    
    setIsValidAccess(true);
    
    // Replace the current history entry to prevent going back to checkout
    window.history.replaceState(null, '', '/success');
    
    // Push a new entry to the current page to create a "trap"
    window.history.pushState(null, '', '/success');
    
    // Listen for popstate events (back button)
    const handlePopState = (event) => {
      // Keep user on success page if they try to go back
      window.history.pushState(null, '', '/success');
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Don't render anything if access is invalid
  if (!isValidAccess) {
    return null;
  }

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

