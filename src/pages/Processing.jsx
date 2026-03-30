import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/success.css';
import { saveNavigationState, validatePaymentState } from '../utils/navigationState';

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Only run this once to avoid double confirmation
    if (hasStarted) return;
    // Use setTimeout to defer state update and avoid synchronous setState
    setTimeout(() => setHasStarted(true), 0);

    const confirmPayment = async () => {
      const stateValidation = validatePaymentState(location.state, [
        'fromPaymentProcess',
        'orderId',
        'paymentMethodId',
        'tilledAccountId',
      ]);

      const state = stateValidation.valid ? stateValidation.data : (location.state || {});

      // Fallbacks for when router state is lost (refresh/new tab)
      const urlParams = new URLSearchParams(window.location.search);
      const fallbackProductId =
        urlParams.get('productId') ||
        (() => {
          try {
            const originalUrl = sessionStorage.getItem('original_checkout_url');
            if (!originalUrl) return null;
            const originalParams = new URL(originalUrl).searchParams;
            return originalParams.get('productId');
          } catch {
            return null;
          }
        })();

      const {
        orderId,
        paymentMethodId,
        tilledAccountId,
        fromPaymentProcess,
      } = state;
      const productId = state.productId || fallbackProductId;

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

      const handlePopState = () => {
        // If user tries to go back, force them forward again to the trap entry
        window.history.forward();
      };

      window.addEventListener('popstate', handlePopState);
      
      // Store the removal function in a way we can cleanup later
      window._temp_remove_trap = () => window.removeEventListener('popstate', handlePopState);

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const apiKey = import.meta.env.VITE_API_KEY;
        const response = await fetch(`${apiBaseUrl}/api/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            orderId,
            payment_method_id: paymentMethodId,
            tilledAccountId,
            productId
          })
        });

        const result = await response.json();

        // Ensure user sees the processing state for at least 1.5 seconds
        setTimeout(() => {
          if (result.success) {
            const successState = { 
              subscription: result.data,
              fromPaymentProcess: true 
            };
            // Save state to sessionStorage as fallback
            saveNavigationState(successState);
            
            navigate('/success', { 
              state: successState,
              replace: true 
            });
          } else {
            const errorState = { 
              error: result.error || result.message || 'Payment failed',
              fromPaymentProcess: true 
            };
            // Save state to sessionStorage as fallback
            saveNavigationState(errorState);
            
            navigate('/failed', { 
              state: errorState,
              replace: true 
            });
          }
        }, 1500);

      } catch (err) {
        console.error('Processing error:', err);
        const errorState = { 
          error: err.message || 'Payment processing failed',
          fromPaymentProcess: true 
        };
        // Save state to sessionStorage as fallback
        saveNavigationState(errorState);
        
        setTimeout(() => navigate('/failed', { 
          state: errorState,
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
