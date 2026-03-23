import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/success.css';

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Only run this once to avoid double confirmation
    if (hasStarted) return;
    setHasStarted(true);

    const confirmPayment = async () => {
      const state = location.state || {};
      const { orderId, paymentMethodId, tilledAccountId, fromPaymentProcess } = state;

      if (!fromPaymentProcess || !orderId || !paymentMethodId || !tilledAccountId) {
        console.error('Invalid access to processing page or missing parameters');
        // No trap here, just send them back
        if (window.history.length > 2) {
          navigate(-1);
        } else {
          navigate('/checkout', { replace: true });
        }
        return;
      }

      // If authorized, NOW create the history trap to prevent back button during processing
      const currentState = window.history.state;
      window.history.replaceState(currentState, '', '/processing');
      window.history.pushState(currentState, '', '/processing');

      const handlePopState = (event) => {
        // If user tries to go back, force them forward again to the trap entry
        window.history.forward();
      };

      window.addEventListener('popstate', handlePopState);
      
      // Store the removal function in a way we can cleanup later
      window._temp_remove_trap = () => window.removeEventListener('popstate', handlePopState);

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${apiBaseUrl}/api/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'pk_prod_athenaEbook_20b33599828f71b9a04389c43a4c1a194d47169fc6d98f84d608054fa2ecf632'
          },
          body: JSON.stringify({
            orderId,
            payment_method_id: paymentMethodId,
            tilledAccountId
          })
        });

        const result = await response.json();

        // Ensure user sees the processing state for at least 1.5 seconds
        setTimeout(() => {
          if (result.success) {
            navigate('/success', { 
              state: { 
                subscription: result.data,
                fromPaymentProcess: true 
              },
              replace: true 
            });
          } else {
            const errorMsg = result.error || result.message || 'Payment failed';
            navigate('/failed', { 
              state: { 
                error: errorMsg,
                fromPaymentProcess: true 
              },
              replace: true 
            });
          }
        }, 1500);

      } catch (err) {
        console.error('Processing error:', err);
        setTimeout(() => navigate('/failed', { 
          state: { fromPaymentProcess: true },
          replace: true 
        }), 1500);
      }
    };

    confirmPayment();

    return () => {
      if (window._temp_remove_trap) {
        window._temp_remove_trap();
        delete window._temp_remove_trap;
      }
    };
  }, [location, navigate, hasStarted]);

  return (
    <div className="payment-success-wrapper">
      <div className="success-modal">
        <div className="processing-spinner-container">
          <div className="processing-spinner"></div>
        </div>
        <div className="success-content">
          <h1 className="success-title">Processing Payment...</h1>
          <p className="success-description">
            Please wait while we securely process your transaction.<br />
            Do not refresh or close this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Processing;
