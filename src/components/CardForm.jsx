import React, { useState, useEffect } from 'react';

const CardForm = ({ clientSecret, onPaymentSuccess, onPaymentFailed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tilled, setTilled] = useState(null);
  const [cardNumber, setCardNumber] = useState(null);
  const [cardExpiry, setCardExpiry] = useState(null);
  const [cardCvv, setCardCvv] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo form state
  const [demoCardNumber, setDemoCardNumber] = useState('');
  const [demoExpiry, setDemoExpiry] = useState('');
  const [demoCvv, setDemoCvv] = useState('');

  useEffect(() => {
    if (clientSecret) {
      // Check if this is demo mode (client secret starts with "demo_client_secret")
      if (clientSecret.startsWith('demo_client_secret')) {
        setIsDemoMode(true);
        setError('Demo mode: Enter any card details to test the payment flow');
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
            setError('Demo mode: Tilled.js not loaded. Enter any card details to test');
          }
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [clientSecret]);

  const initializeTilled = async () => {
    try {
      // Check if Tilled is available
      if (!window.Tilled) {
        console.warn('Tilled.js not loaded. Using demo mode.');
        setError('Demo mode: Tilled.js not loaded. Update your Tilled credentials in CardForm.jsx');
        return;
      }

      // Initialize Tilled with your publishable key and account ID
      // You'll need to replace these with your actual Tilled credentials
      const tilledInstance = new window.Tilled('your_publishable_key', {
        account: 'your_account_id'
      });

      setTilled(tilledInstance);

      // Create card fields
      const cardNumberField = tilledInstance.createField('cardNumber', {
        styles: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });

      const cardExpiryField = tilledInstance.createField('cardExpiry', {
        styles: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });

      const cardCvvField = tilledInstance.createField('cardCvv', {
        styles: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });

      // Mount fields to DOM elements
      cardNumberField.mount('#card-number');
      cardExpiryField.mount('#card-expiry');
      cardCvvField.mount('#card-cvv');

      setCardNumber(cardNumberField);
      setCardExpiry(cardExpiryField);
      setCardCvv(cardCvvField);
    } catch (err) {
      console.error('Error initializing Tilled:', err);
      setError('Failed to initialize payment form. Please check your Tilled credentials.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isDemoMode) {
      // Demo mode - simulate payment processing
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      setTimeout(() => {
        // For demo, let's randomly succeed or fail (80% success rate)
        if (Math.random() > 0.2) {
          onPaymentSuccess();
        } else {
          setError('Demo payment failed. Please try again.');
          onPaymentFailed();
        }
        setIsLoading(false);
      }, 2000);
      return;
    }
    
    if (!tilled || !clientSecret) {
      setError('Payment form not properly initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await tilled.confirmPayment(clientSecret);
      
      if (result.status === 'succeeded') {
        onPaymentSuccess();
      } else {
        setError(result.error?.message || 'Payment failed');
        onPaymentFailed();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      onPaymentFailed();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-form">
      {error && <div className="error-message">{error}</div>}
      
      {isDemoMode ? (
        <>
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
        </>
      ) : (
        <>
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
        </>
      )}

      <button 
        type="submit" 
        className="pay-button" 
        disabled={isLoading || (!tilled && !isDemoMode)}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CardForm;
