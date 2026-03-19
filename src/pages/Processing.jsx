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
      // Get data from location state or URL params as fallback
      const state = location.state || {};
      const urlParams = new URLSearchParams(window.location.search);
      
      const orderId = state.orderId || urlParams.get('orderId');
      const paymentMethodId = state.paymentMethodId || urlParams.get('paymentMethodId');
      const tilledAccountId = state.tilledAccountId || urlParams.get('tilledAccountId');

      if (!orderId || !paymentMethodId || !tilledAccountId) {
        console.error('Missing required payment parameters:', { orderId, paymentMethodId, tilledAccountId });
        // Give it a tiny delay so the user sees the processing state briefly
        setTimeout(() => navigate('/failed', { replace: true }), 1500);
        return;
      }

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

        // Ensure user sees the processing state for at least 1.5 seconds for a smooth transition
        setTimeout(() => {
          if (result.success) {
            navigate('/success', { 
              state: { subscription: result.data },
              replace: true 
            });
          } else {
            const errorMsg = result.error || result.message || 'Payment failed';
            navigate('/failed', { 
              state: { error: errorMsg },
              replace: true 
            });
          }
        }, 1500);

      } catch (err) {
        console.error('Processing error:', err);
        setTimeout(() => navigate('/failed', { replace: true }), 1500);
      }
    };

    confirmPayment();
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
