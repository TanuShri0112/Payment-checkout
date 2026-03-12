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
            product_name: 'Demo Product',
            amount: 2999, // $29.99
            client_secret: 'demo_client_secret_' + Math.random().toString(36).substr(2, 9)
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
      <div className="checkout-content">
        <div className="product-summary">
          <h2>Order Summary</h2>
          <div className="product-details">
            <div className="product-name">{sessionData.product_name}</div>
            <div className="product-price">${(sessionData.amount / 100).toFixed(2)}</div>
          </div>
        </div>

        <div className="payment-section">
          <h2>Payment Details</h2>
          <CardForm 
            clientSecret={sessionData.client_secret}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
