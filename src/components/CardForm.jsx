import React, { useState, useEffect } from 'react';

const CardForm = ({ orderId, tilledAccountId, publishableKey, email, customerName, onPaymentSuccess, onPaymentFailed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tilled, setTilled] = useState(null);
  const [form, setForm] = useState(null);
  const [zip, setZip] = useState('');

  useEffect(() => {
    if (publishableKey && tilledAccountId) {
      if (window.Tilled) {
        initializeTilled();
      } else {
        const timer = setTimeout(() => {
          if (window.Tilled) initializeTilled();
          else setError('Tilled.js not loaded. Please refresh the page.');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [publishableKey, tilledAccountId]);

  const initializeTilled = async () => {
    try {
      console.log('Initializing Tilled with:', { publishableKey, tilledAccountId, sandbox: true });
      
      // Correct 3-argument signature from docs: new Tilled(publishableKey, accountId, options)
      const tilledInstance = new window.Tilled(publishableKey, tilledAccountId, {
        sandbox: true,
      });

      setTilled(tilledInstance);

      const tilledForm = await tilledInstance.form({
        payment_method_type: 'card',
      });
      setForm(tilledForm);

      const fieldOptions = {
        styles: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
          },
        },
      };

      tilledForm.createField('cardNumber', fieldOptions).inject('#card-number');
      tilledForm.createField('cardExpiry', fieldOptions).inject('#card-expiry');
      tilledForm.createField('cardCvv', fieldOptions).inject('#card-cvv');

      await tilledForm.build();
    } catch (err) {
      console.error('Error initializing Tilled:', err);
      setError('Failed to initialize payment form.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tilled || !form || !orderId) {
      setError('Payment form not properly initialized');
      return;
    }

    if (!zip) {
      setError('ZIP Code is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting payment with billing details:', {
        name: customerName,
        email: email,
        zip: zip,
      });
      
      // 1. Create Payment Method (Tokenize Card)
      // Following the structure in the provided documentation exactly
      const paymentMethod = await tilled.createPaymentMethod({
        type: 'card',
        billing_details: {
          name: customerName || 'Customer',
          email: email || 'test@example.com',
          address: {
            zip: zip,
            country: 'US',
          },
        }
      });
      
      if (paymentMethod.error) {
        throw new Error(paymentMethod.error.message || 'Failed to tokenize card');
      }

      console.log("Created Payment Method:", paymentMethod.id);

      // 2. Confirm to our Backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBaseUrl}/api/payments/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'pk_prod_athenaEbook_20b33599828f71b9a04389c43a4c1a194d47169fc6d98f84d608054fa2ecf632'
        },
        body: JSON.stringify({
          orderId: orderId,
          payment_method_id: paymentMethod.id
        })
      });

      const result = await response.json();

      if (result.success) {
        onPaymentSuccess(result.data);
      } else {
        const msg = result.error || result.message || 'Subscription confirmation failed';
        setError(msg);
        onPaymentFailed(msg);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment');
      onPaymentFailed(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="card-number">Card Number</label>
        <div id="card-number" className="card-field"></div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="card-expiry">Expiry Date</label>
          <div id="card-expiry" className="card-field"></div>
        </div>

        <div className="form-group">
          <label htmlFor="card-cvv">CVV</label>
          <div id="card-cvv" className="card-field"></div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="card-zip">ZIP Code</label>
        <input 
          type="text" 
          id="card-zip" 
          className="zip-input" 
          placeholder="e.g. 80021"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
      </div>

      <button 
        type="submit" 
        className="pay-button" 
        disabled={isLoading || !tilled}
      >
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};

export default CardForm;
