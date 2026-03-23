import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/success.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attemptsRemaining, setAttemptsRemaining] = useState(2);
  const [orderId, setOrderId] = useState(null);
  const [isValidAccess, setIsValidAccess] = useState(false);

  useEffect(() => {
    // Check if user came from a valid payment flow using React Router state
    // This is the most secure way to prevent URL "cheating"
    const hasInternalState = location.state && location.state.fromPaymentProcess;
    
    // Check if session storage has attempt info
    const hasValidPaymentFlow = hasInternalState || sessionStorage.getItem('payment_attempt_completed') === 'true';
    const hasRecentOrder = sessionStorage.getItem('last_order_id');
    
    // Stricter check: if they just typed the URL (no state), they shouldn't see this page
    if (!hasInternalState) {
      console.warn('Unauthorized access attempts detected for failed page');
      // If history exists, simply return them to the previous page
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/checkout', { replace: true });
      }
      return;
    }
    
    setIsValidAccess(true);
    
    // Get order ID ONLY from state (preferred) or session storage for payment context
    const currentOrderId = (location.state?.orderId) || 
                          (location.state?.subscription?.order_id) || 
                          sessionStorage.getItem('last_order_id');
    
    if (currentOrderId) {
      setOrderId(currentOrderId);
      const attemptKey = `payment_attempts_${currentOrderId}`;
      const currentAttempts = parseInt(sessionStorage.getItem(attemptKey) || '0');
      const maxAttempts = 3;
      const remaining = Math.max(0, maxAttempts - currentAttempts);
      setAttemptsRemaining(remaining);
    }

    // Replace the current history entry and push a trap to prevent accidental back navigation
    const currentHistState = window.history.state;
    window.history.replaceState(currentHistState, '', '/failed');
    window.history.pushState(currentHistState, '', '/failed');
    
    const handlePopState = (event) => {
      // If user tries to go back, force them forward again to the trap entry
      window.history.forward();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);

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

  const handleTryAgain = () => {
    if (attemptsRemaining > 0) {
      // Get the original checkout URL parameters from sessionStorage
      const originalUrl = sessionStorage.getItem('original_checkout_url');
      const lastOrderId = sessionStorage.getItem('last_order_id');
      
      if (originalUrl) {
        // Navigate to the original checkout URL with all parameters
        window.location.href = originalUrl;
      } else if (lastOrderId) {
        // Fallback: navigate to checkout with orderId
        navigate(`/checkout?orderId=${lastOrderId}`, { replace: true });
      } else {
        // Final fallback: navigate to root checkout
        navigate('/checkout', { replace: true });
      }
    }
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
            {attemptsRemaining > 0 
              ? 'The transaction could not be completed. Please check your card details and try again.'
              : null
            }
          </p>
          {attemptsRemaining > 0 ? (
            <button 
              onClick={handleTryAgain}
              className="success-link-button try-again-button"
            >
              Try Payment Again
            </button>
          ) : (
            <p className="max-attempts-message">
              Maximum payment attempts reached. Please go back to the product page and initiate a new payment flow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;

