import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const Home = () => {
  const navigate = useNavigate();

  const handleDemoCheckout = () => {
    // Navigate to checkout with demo query parameters
    navigate('/checkout?productId=prod_demo_123&planId=plan_demo_456&userId=usr_demo_789&email=demo@lmsathena.com');
  };

  return (
    <div className="checkout-container">
      <div className="result-container">
        <h1>Welcome to LMS Athena Payment</h1>
        <p>Complete payment processing with secure checkout</p>
        
        <div className="demo-section">
          <h3>Try Demo Checkout</h3>
          <p>Click below to test the payment flow with a demo session:</p>
          <button 
            className="retry-button" 
            onClick={handleDemoCheckout}
          >
            Start Demo Checkout
          </button>
        </div>

        <div className="instructions">
          <h3>For Development</h3>
          <p>To test with a specific session ID, navigate to:</p>
          <code>/checkout?session_id=your_session_id</code>
        </div>
      </div>
    </div>
  );
};

export default Home;
