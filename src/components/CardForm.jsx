import React, { useState, useEffect } from 'react';

const CardForm = ({ orderId, tilledAccountId, publishableKey, email, customerName, onPaymentSuccess, onPaymentFailed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tilled, setTilled] = useState(null);
  const [form, setForm] = useState(null);
  const [zip, setZip] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (publishableKey && tilledAccountId && !tilled) {
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
  }, [publishableKey, tilledAccountId, tilled]);

  const initializeTilled = async () => {
    try {
      if (tilled) return;

      console.log('Initializing Tilled with:', { publishableKey, tilledAccountId, sandbox: true });
      
      const tilledInstance = new window.Tilled(publishableKey, tilledAccountId, {
        sandbox: true,
        log_level: 0,
      });

      window.tilledInstance = tilledInstance;
      setTilled(tilledInstance);

      const tilledForm = await tilledInstance.form({
        payment_method_type: 'card',
      });
      setForm(tilledForm);

      const fieldOptions = {
        styles: {
          base: {
            fontFamily: "Helvetica Neue, Arial, sans-serif",
            color: "#304166",
            fontWeight: "400",
            fontSize: "16px",
          },
          invalid: {
            color: "#EA4628",
          },
          valid: {
            color: "#59C288",
          },
        },
      };

      tilledForm.createField('cardNumber', { ...fieldOptions, placeholder: 'Card Number' }).inject('#card-number');
      tilledForm.createField('cardExpiry', { ...fieldOptions, placeholder: 'MM/YY' }).inject('#card-expiry');
      tilledForm.createField('cardCvv', { ...fieldOptions, placeholder: 'CVV' }).inject('#card-cvv');

      // Add validation listener as seen in demo
      tilledForm.on('validation', (event) => {
        setIsValid(!tilledForm.invalid);
      });

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

    const billingEmail = email || 'test@example.com';
    const billingName = customerName || 'Customer';

    try {
      console.log('Generating payload and calling createPaymentMethod...');
      console.log('Form object:', form, '| Form valid:', form && !form.invalid);
      
      // Following the demo's "handleSavePaymentMethod" exact structure
      const paymentMethod = await tilled.createPaymentMethod({
        type: 'card',
        billing_details: {
          name: billingName,
          email: billingEmail,
          address: {
            zip: zip,
            country: 'US',
          },
        }
      }, form);
      
      console.log('Tilled response:', paymentMethod);

      if (paymentMethod.error) {
        throw new Error(paymentMethod.error.message || 'Failed to tokenize card');
      }

      console.log("Created Payment Method ID:", paymentMethod.id);

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
          payment_method_id: paymentMethod.id,
          tilledAccountId: tilledAccountId
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
    <div className="card-form-container">
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
          disabled={isLoading || !tilled || !isValid}
        >
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </button>
        {!isValid && !isLoading && tilled && (
          <p className="validation-hint">Please enter valid card details</p>
        )}
      </form>
    </div>
  );
};

export default CardForm;
