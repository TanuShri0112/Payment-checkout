import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardForm from '../components/CardForm';
import '../styles/checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tilledConfig, setTilledConfig] = useState(null);
  const [queryParams, setQueryParams] = useState({});

  useEffect(() => {
    // Extract query parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      productId: urlParams.get('productId'),
      planId: urlParams.get('planId'),
      userId: urlParams.get('userId'),
      email: urlParams.get('email')
    };
    setQueryParams(params);

    // Validate required parameters
    if (!params.productId || !params.planId || !params.userId || !params.email) {
      setError('Missing required parameters. Please access checkout from the product page.');
      setLoading(false);
      return;
    }

    // Fetch Tilled configuration
    fetchTilledConfig(params.productId);
  }, []);

  const fetchTilledConfig = async (productId) => {
    try {
      const response = await fetch(`/api/config?productId=${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const config = await response.json();
      setTilledConfig(config);
    } catch (err) {
      console.error('Error fetching Tilled config:', err);
      setError('Failed to load payment configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <div className="checkout-header">
          <div className="company-info">
            <span className="company-logo">�️</span>
            <span className="company-name">LMS Athena</span>
          </div>
          <div className="order-info">
            <span className="order-label">Plan ID:</span>
            <span className="order-id">{queryParams.planId}</span>
          </div>
        </div>

        <div className="checkout-content">
          {/* Product Section */}
          <div className="product-section">
            <h3>Subscription Details</h3>
            <div className="product-card">
              <div className="product-info">
                <h4 className="product-name">Premium Subscription</h4>
                <p className="product-description">
                  Monthly access to all premium features
                </p>
                <div className="user-details">
                  <p><strong>Email:</strong> {queryParams.email}</p>
                  <p><strong>User ID:</strong> {queryParams.userId}</p>
                  <p><strong>Product ID:</strong> {queryParams.productId}</p>
                </div>
              </div>
              <div className="product-price-section">
                <div className="price-label">Monthly Price</div>
                <div className="product-price">$29.99</div>
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
                tilledConfig={tilledConfig}
                queryParams={queryParams}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="checkout-footer">
          <p> 2024 LMS Athena. All rights reserved.</p>
          <div className="payment-methods">
            <span>Accepted Payment Methods:</span>
            <span className="payment-icons"> Visa • Mastercard • Amex</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
