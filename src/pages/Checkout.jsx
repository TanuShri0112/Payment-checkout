import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from '../utils/getSessionId';
import { getCheckoutSession } from '../services/paymentService';
import CardForm from '../components/CardForm';
import '../styles/checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      try {
        const sessionId = getSessionId();
        
        if (!sessionId) {
          setError('No session ID found in URL');
          setIsLoading(false);
          return;
        }

        // Check if this is a demo session
        if (sessionId.startsWith('demo_session_')) {
          // Use mock data for demo sessions
          const mockData = {
            product_name: 'Premium Subscription Plan',
            product_description: 'Monthly access to all premium features',
            amount: 2999, // $29.99
            client_secret: 'demo_client_secret_' + Math.random().toString(36).substr(2, 9),
            company_name: 'LMS Athena',
            company_logo: '�️',
            order_id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
          };
          setSessionData(mockData);
        } else {
          // Fetch real data from API
          const data = await getCheckoutSession(sessionId);
          setSessionData(data);
        }
      } catch (err) {
        console.error('Error fetching checkout session:', err);
        setError('Failed to load checkout session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutSession();
  }, []);

  const handlePaymentSuccess = () => {
    navigate('/success');
  };

  const handlePaymentFailed = () => {
    navigate('/failed');
  };

  if (isLoading) {
    return (
      <div className="checkout-container">
        <div className="loading">Loading checkout...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="checkout-container">
        <div className="error-message">No checkout session data available</div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-page">
        {/* Header */}
        <div className="checkout-header">
          <div className="company-info">
            <span className="company-logo">{sessionData.company_logo || '🏢'}</span>
            <span className="company-name">{sessionData.company_name || 'TechCorp Solutions'}</span>
          </div>
          <div className="order-info">
            <span className="order-label">Order ID:</span>
            <span className="order-id">{sessionData.order_id || 'DEMO-ORDER'}</span>
          </div>
        </div>

        <div className="checkout-content">
          {/* Product Section */}
          <div className="product-section">
            <h3>Product Details</h3>
            <div className="product-card">
              <div className="product-info">
                <h4 className="product-name">{sessionData.product_name}</h4>
                <p className="product-description">
                  {sessionData.product_description || 'Digital product with premium features'}
                </p>
              </div>
              <div className="product-price-section">
                <div className="price-label">Total Amount</div>
                <div className="product-price">${(sessionData.amount / 100).toFixed(2)}</div>
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
                clientSecret={sessionData.client_secret}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailed={handlePaymentFailed}
              />
            </div>
          </div>
        </div>

        <div className="checkout-footer">
          <p>© 2024 {sessionData.company_name || 'LMS Athena'}. All rights reserved.</p>
          <div className="payment-methods">
            <span>Accepted Payment Methods:</span>
            <span className="payment-icons">💳 Visa • 💳 Mastercard • 💳 Amex</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
