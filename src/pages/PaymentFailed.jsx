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
    // Check if user came from a valid payment flow
    const hasValidPaymentFlow = sessionStorage.getItem('payment_attempt_completed') === 'true';
    const hasRecentOrder = sessionStorage.getItem('last_order_id');
    
    if (!hasValidPaymentFlow || !hasRecentOrder) {
      // Redirect to checkout if access is invalid
      navigate('/checkout', { replace: true });
      return;
    }
    
    setIsValidAccess(true);
    
    // Get order ID from URL params or state
    const urlParams = new URLSearchParams(window.location.search);
    const currentOrderId = urlParams.get('orderId') || 
                         (location.state?.subscription?.order_id) || 
                         hasRecentOrder;
    
    if (currentOrderId) {
      setOrderId(currentOrderId);
      const attemptKey = `payment_attempts_${currentOrderId}`;
      const currentAttempts = parseInt(sessionStorage.getItem(attemptKey) || '0');
      const maxAttempts = 3;
      const remaining = Math.max(0, maxAttempts - currentAttempts);
      setAttemptsRemaining(remaining);
    }

    // Replace the current history entry to prevent going back to checkout
    window.history.replaceState(null, '', '/failed');
    
    // Push a new entry to the current page to create a "trap"
    window.history.pushState(null, '', '/failed');
    
    // Listen for popstate events (back button)
    const handlePopState = (event) => {
      // Keep user on failed page if they try to go back
      window.history.pushState(null, '', '/failed');
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);

  // Don't render anything if access is invalid
  if (!isValidAccess) {
    return null;
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
              ? `The transaction could not be completed. Please check your card details and try again. ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} remaining.`
              : 'Maximum payment attempts reached. Please go back to the product page and initiate a new payment flow.'
            }
          </p>
          {attemptsRemaining > 0 ? (
            <button 
              onClick={handleTryAgain}
              className="success-link-button try-again-button"
            >
              Try Payment Again ({attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining)
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

