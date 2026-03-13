import React, { useState, useEffect } from 'react';

const CardForm = ({ tilledConfig, queryParams, onPaymentSuccess, onPaymentFailed }) => {
  const [tilled, setTilled] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);
  const [cardExpiry, setCardExpiry] = useState(null);
  const [cardCvv, setCardCvv] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo form state
  const [demoCardNumber, setDemoCardNumber] = useState('');
  const [demoExpiry, setDemoExpiry] = useState('');
  const [demoCvv, setDemoCvv] = useState('');
  const [userName, setUserName] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (tilledConfig) {
      // Check if this is demo mode
      if (tilledConfig.publishableKey && tilledConfig.publishableKey.startsWith('demo_')) {
        setIsDemoMode(true);
        setError('Demo mode: Enter any card details to test the subscription flow');
        return;
      }

      if (window.Tilled) {
        initializeTilled();
      } else {
        // Tilled not loaded yet, wait a bit and try again
        const timer = setTimeout(() => {
          if (window.Tilled) {
            initializeTilled();
          } else {
            console.warn('Tilled.js not loaded. Using demo mode.');
            setIsDemoMode(true);
            setError('Demo mode: Tilled.js not loaded. Update your Tilled credentials in CardForm.jsx');
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [tilledConfig]);

  const initializeTilled = async () => {
    try {
      const tilledInstance = new window.Tilled(
        tilledConfig.publishableKey,
        tilledConfig.accountId,
        {
          sandbox: true // Set to false for production
        }
      );

      const form = await tilledInstance.form({
        payment_method_type: 'card',
      });

      // Create and mount card fields
      const cardNumberField = await form.createField('cardNumber');
      const cardExpiryField = await form.createField('cardExpiry');
      const cardCvvField = await form.createField('cardCvv');

      cardNumberField.mount('#card-number');
      cardExpiryField.mount('#card-expiry');
      cardCvvField.mount('#card-cvv');

      await form.build();

      setCardNumber(cardNumberField);
      setCardExpiry(cardExpiryField);
      setCardCvv(cardCvvField);
      setTilled(tilledInstance);
    } catch (err) {
      console.error('Error initializing Tilled:', err);
      setError('Failed to initialize payment form');
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (isDemoMode) {
      // Demo mode - simulate subscription creation
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      setTimeout(() => {
        // For demo, let's randomly succeed or fail (80% success rate)
        if (Math.random() > 0.2) {
          const subscriptionData = {
            success: true,
            subscriptionId: 'sub_demo_' + Math.random().toString(36).substr(2, 9),
            customerId: 'cus_demo_' + Math.random().toString(36).substr(2, 9)
          };
          onPaymentSuccess(subscriptionData);
        } else {
          setError('Demo subscription failed. Please try again.');
          onPaymentFailed('Demo subscription failed');
        }
        setIsLoading(false);
      }, 2000);
      return;
    }
    
    if (!tilled || !tilledConfig) {
      setError('Payment form not properly initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate Payment Method ID
      const paymentMethod = await tilled.createPaymentMethod({
        type: 'card',
        billing_details: {
          name: userName,
          address: {
            zip: zipCode
          }
        }
      });

      const paymentMethodId = paymentMethod.id;
      
      // 2. Send to backend for subscription creation
      const subscriptionResponse = await createSubscriptionOnBackend(paymentMethodId);
      
      if (subscriptionResponse.success) {
        onPaymentSuccess(subscriptionResponse);
      } else {
        setError(subscriptionResponse.error || 'Subscription creation failed');
        onPaymentFailed(subscriptionResponse.error);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'An error occurred during subscription');
      onPaymentFailed(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSubscriptionOnBackend = async (paymentMethodId) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          productId: queryParams.productId,
          planId: queryParams.planId,
          userId: queryParams.userId,
          email: queryParams.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (err) {
      console.error('Backend subscription error:', err);
      return {
        success: false,
        error: 'Failed to create subscription. Please try again.'
      };
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="card-form">
      {error && <div className="error-message">{error}</div>}
      
      {isDemoMode ? (
        <>
          <div className="form-group">
            <label htmlFor="user-name">Full Name</label>
            <input
              id="user-name"
              type="text"
              className="card-field demo-input"
              placeholder="John Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="card-number">Card Number</label>
            <input
              id="card-number"
              type="text"
              className="card-field demo-input"
              placeholder="1234 5678 9012 3456"
              value={demoCardNumber}
              onChange={(e) => setDemoCardNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="card-expiry">Expiry Date</label>
              <input
                id="card-expiry"
                type="text"
                className="card-field demo-input"
                placeholder="MM/YY"
                value={demoExpiry}
                onChange={(e) => setDemoExpiry(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-cvv">CVV</label>
              <input
                id="card-cvv"
                type="text"
                className="card-field demo-input"
                placeholder="123"
                value={demoCvv}
                onChange={(e) => setDemoCvv(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zip-code">ZIP Code</label>
            <input
              id="zip-code"
              type="text"
              className="card-field demo-input"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="user-name">Full Name</label>
            <input
              id="user-name"
              type="text"
              className="card-field demo-input"
              placeholder="John Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="card-number">Card Number</label>
            <div id="card-number" className="card-field" data-placeholder="1234 5678 9012 3456"></div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="card-expiry">Expiry Date</label>
              <div id="card-expiry" className="card-field" data-placeholder="MM/YY"></div>
            </div>

            <div className="form-group">
              <label htmlFor="card-cvv">CVV</label>
              <div id="card-cvv" className="card-field" data-placeholder="123"></div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zip-code">ZIP Code</label>
            <input
              id="zip-code"
              type="text"
              className="card-field demo-input"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <button 
        type="submit" 
        className="pay-button" 
        disabled={isLoading || (!tilled && !isDemoMode)}
      >
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};

export default CardForm;
