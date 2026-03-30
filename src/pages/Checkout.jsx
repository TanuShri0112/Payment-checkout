import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardForm from '../components/CardForm';
import '../styles/checkout.css';
import athenaLogo from '../assets/athenalms_logo.png';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [productId, setProductId] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      try {
        // Store the original checkout URL for retry functionality
        const currentUrl = window.location.href;
        sessionStorage.setItem('original_checkout_url', currentUrl);
        
        // Initialize payment attempt tracking for this order
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
          const attemptKey = `payment_attempts_${orderId}`;
          const currentAttempts = sessionStorage.getItem(attemptKey);
          
          // Only initialize if no attempts tracked yet (fresh checkout session)
          if (!currentAttempts) {
            sessionStorage.setItem(attemptKey, '0');
          }
        }
        
        const productIdFromUrl = urlParams.get('productId');
        setProductId(productIdFromUrl);
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
            productId: productIdFromUrl
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
          // API key from environment variable
          const apiKey = import.meta.env.VITE_API_KEY;
          
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
          const newOrderId = newParams.get('orderId');

          // Initialize payment attempt tracking for the new order
          if (newOrderId) {
            const attemptKey = `payment_attempts_${newOrderId}`;
            sessionStorage.setItem(attemptKey, '0');
            sessionStorage.setItem('last_order_id', newOrderId);
          }

          setSessionData({
            order_id: newOrderId,
            publishableKey: newParams.get('publishableKey'),
            tilledAccountId: newParams.get('tilledAccountId'),
            amount: parseInt(newParams.get('amount')) || 0,
            currency: newParams.get('currency') || 'USD',
            product_name: 'Subscription Payment',
            company_name: 'Athena LMS',
            email: email,
            userId: userId,
            productId: productIdFromUrl
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
    navigate('/success', { state: { subscription: subscriptionData, fromPaymentProcess: true } });
  };

  const handlePaymentFailed = (errorMessage) => {
    // Navigate to failed page
    navigate('/failed', { state: { fromPaymentProcess: true, error: errorMessage } });
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
        <div className="payment-success-wrapper">
          <div className="success-modal">
            <div className="success-logo-outer">
              <div className="success-logo-inner" style={{ background: '#ef4444' }}>
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
                    !
                  </text>
                </svg>
              </div>
            </div>
            
            <div className="success-content">
              <h1 className="success-title">Invalid Checkout URL</h1>
              <p className="success-description">
                {error}
              </p>
            </div>
          </div>
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
            {/* Animated Waves */}
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            
            {/* SVG Wave Pattern */}
            <svg className="svg-wave" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,300 Q100,200 200,300 T400,300 L400,600 L0,600 Z" fill="url(#waveGradient)" opacity="0.3"/>
              <path d="M0,400 Q100,300 200,400 T400,400 L400,600 L0,600 Z" fill="url(#waveGradient2)" opacity="0.2"/>
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
                </linearGradient>
                <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
            </svg>
            
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
              </div>
              <CardForm 
                orderId={sessionData.order_id}
                tilledAccountId={sessionData.tilledAccountId}
                publishableKey={sessionData.publishableKey}
                email={sessionData.email}
                customerName={sessionData.customer_name || 'Customer'}
                productId={sessionData.productId}
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
