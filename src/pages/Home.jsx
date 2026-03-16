import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('orderId') || urlParams.get('productId')) {
      navigate('/checkout' + window.location.search, { replace: true });
    }
  }, [navigate]);

  const handleDemoCheckout = () => {
    // Navigate to checkout with demo query parameters
    navigate('/checkout?productId=prod_demo_123&planId=plan_demo_456&userId=usr_demo_789&email=demo@lmsathena.com');
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to Athena LMS Payment</h1>
        <p>Complete payment processing with secure checkout</p>
        
        <div className="demo-section">
          <h3>Try Demo Checkout</h3>
          <p>Click below to test the payment flow with a demo session:</p>
          <button className="demo-button" onClick={handleDemoCheckout}>
            Start Demo Checkout
          </button>
        </div>

        <div className="dev-section">
          <h3>For Development</h3>
          <p>The system now supports direct product parameters:</p>
          <div className="code-snippet">
            /checkout?productId=...&planId=...&userId=...&email=...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
