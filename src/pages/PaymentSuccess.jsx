import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/success.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [isValidAccess, setIsValidAccess] = useState(false);

  useEffect(() => {
    // Check if user came from a valid payment flow using React Router state
    // This is the most secure way to prevent URL "cheating" or direct path access
    const hasInternalState = location.state && location.state.fromPaymentProcess;
    
    // We strictly require internal state to show this page
    if (!hasInternalState) {
      console.warn('Unauthorized access attempts detected for success page');
      // If history exists (user was on checkout), return them to where they were
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        // Otherwise send them back to checkout
        navigate('/checkout', { replace: true });
      }
      return;
    }
    
    setIsValidAccess(true);
    
    // Replace the current history entry and push a trap to prevent accidental back navigation
    const currentHistState = window.history.state;
    window.history.replaceState(currentHistState, '', '/success');
    window.history.pushState(currentHistState, '', '/success');
    
    // Listen for popstate events (back button)
    const handlePopState = (event) => {
      // If user tries to go back, force them forward again to the trap entry
      window.history.forward();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location]);

  // While we are checking access, return a blank modal with spinner instead of null
  // This avoids the black screen since !isValidAccess starts as false
  if (!isValidAccess) {
    return (
      <div className="payment-success-wrapper">
        <div className="success-modal" style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="processing-spinner-container">
            <div className="processing-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-wrapper">
      <div className="success-modal">
        <div className="success-logo-outer">
          <div className="success-logo-inner">
            <svg viewBox="0 0 100 100" className="success-svg-logo" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M30 50 L45 65 L70 35" 
                fill="none" 
                stroke="white" 
                strokeWidth="10" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
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

