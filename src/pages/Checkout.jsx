import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardForm from '../components/CardForm';
import '../styles/checkout.css';
import athenaLogo from '../assets/athenalms_logo.png';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null); // New state for session data

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        // Data we might already have from the URL
        const publishableKeyFromUrl = urlParams.get('publishableKey');
        const tilledAccountIdFromUrl = urlParams.get('tilledAccountId');
        const amountFromUrl = urlParams.get('amount');
        const currencyFromUrl = urlParams.get('currency');

        // If we have all required Tilled data, just use it
        if (orderId && publishableKeyFromUrl && tilledAccountIdFromUrl) {
          setSessionData({
            order_id: orderId,
            publishableKey: publishableKeyFromUrl,
            tilledAccountId: tilledAccountIdFromUrl,
            amount: parseInt(amountFromUrl) || 0,
            currency: currencyFromUrl || 'USD',
            product_name: 'Subscription Payment',
            company_name: 'Athena LMS',
            email: urlParams.get('email'),
            userId: urlParams.get('userId'),
          });
          setLoading(false);
          return;
        }

        // If we DON'T have orderId but have productId/planId, initiate it
        const productId = urlParams.get('productId');
        const planId = urlParams.get('planId');
        const userId = urlParams.get('userId');
        const email = urlParams.get('email');

        if (productId && planId && userId && email) {
          // Hardcoded for testing as requested
          const apiKey = 'pk_prod_athenaEbook_20b33599828f71b9a04389c43a4c1a194d47169fc6d98f84d608054fa2ecf632';
          
          console.log('Initiating payment session for:', { productId, planId });
          
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
          const response = await fetch(`${apiBaseUrl}/api/payments`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'idempotency-key': 'init-' + Date.now()
            },
            body: JSON.stringify({
              productId,
              planId,
              userId,
              email,
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to initiate payment');
          }

          const result = await response.json();
          // The backend returns a checkoutUrl, let's just parse its params
          const newUrl = new URL(result.checkoutUrl);
          const newParams = new URLSearchParams(newUrl.search);

          setSessionData({
            order_id: newParams.get('orderId'),
            publishableKey: newParams.get('publishableKey'),
            tilledAccountId: newParams.get('tilledAccountId'),
            amount: parseInt(newParams.get('amount')) || 0,
            currency: newParams.get('currency') || 'USD',
            product_name: 'Subscription Payment',
            company_name: 'Athena LMS',
            email: email,
            userId: userId,
          });
        } else {
          setError('Invalid checkout URL: Missing required parameters.');
        }
      } catch (err) {
        console.error('Error processing checkout data:', err);
        setError(`Checkout Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutSession();
  }, []);

  const handlePaymentSuccess = (subscriptionData) => {
    // Navigate to success page with subscription details
    navigate('/success', { state: { subscription: subscriptionData } });
  };

  const handlePaymentFailed = (errorMessage) => {
    // Navigate to failed page
    navigate('/failed');
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="result-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="result-container">
          <div className="error-message">{error}</div>
          <button 
            className="retry-button" 
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-page">
        <div className="checkout-content">
          {/* Product Section */}
          <div className="product-section">
            <div className="product-card">
              <div className="company-header">
                <img src={athenaLogo} alt="Athena LMS" height="28" style={{ width: 'auto', objectFit: 'contain' }} />
                <span className="company-title">Athena LMS</span>
              </div>
              <h3>Subscription Details</h3>
              <div className="product-info">
                <h4 className="product-name">{sessionData.product_name}</h4>
                <p className="product-description">
                  Securely process your subscription payment.
                </p>
                <div className="user-details">
                  <p><strong>Order ID:</strong> <span>{sessionData.order_id}</span></p>
                  {sessionData.email && <p><strong>Email:</strong> <span>{sessionData.email}</span></p>}
                  {sessionData.userId && <p><strong>User ID:</strong> <span>{sessionData.userId}</span></p>}
                </div>
              </div>
              <div className="product-price-section">
                <div className="price-label">Price</div>
                <div className="product-price">
                  ${(sessionData.amount / 100).toFixed(2)} 
                  <div className="currency">
                    {sessionData.currency.toUpperCase()}
                    <span>/ month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h3>Payment Information</h3>
            <div className="payment-card">
              <div className="payment-header">
                <span className="payment-title">Secure Payment</span>
                <span className="secure-badge">🔒 SSL Encrypted</span>
              </div>
              <CardForm 
                orderId={sessionData.order_id}
                tilledAccountId={sessionData.tilledAccountId}
                publishableKey={sessionData.publishableKey}
                email={sessionData.email}
                customerName={sessionData.customer_name || 'Customer'}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
