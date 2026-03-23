import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CardForm = ({ orderId, tilledAccountId, publishableKey, email, customerName, onPaymentSuccess, onPaymentFailed }) => {
  const navigate = useNavigate();
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

    // Increment attempt counter before processing payment
    const attemptKey = `payment_attempts_${orderId}`;
    const currentAttempts = parseInt(sessionStorage.getItem(attemptKey) || '0');
    sessionStorage.setItem(attemptKey, (currentAttempts + 1).toString());

    // Store order ID for reference in failed page
    sessionStorage.setItem('last_order_id', orderId);

    // Mark that a payment attempt was made (for route protection)
    sessionStorage.setItem('payment_attempt_completed', 'true');

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
      
      // Store checkout metadata for safety
      sessionStorage.setItem('last_order_id', orderId);
      sessionStorage.setItem('payment_attempt_completed', 'true');

      // Navigate to processing page for backend confirmation
      navigate('/processing', { 
        state: { 
          orderId, 
          paymentMethodId: paymentMethod.id, 
          tilledAccountId,
          fromPaymentProcess: true
        },
        replace: true
      });
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
          <div className="card-field card-field-with-icons">
            <div id="card-number" className="tilled-field"></div>
            <div className="field-icons">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" alt="JCB" />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="card-expiry">Expiry Date</label>
            <div className="card-field card-field-with-icons">
              <div id="card-expiry" className="tilled-field"></div>
              <div className="field-icons" style={{ paddingRight: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 2V6" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 2V6" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10H21" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="card-cvv">CVV</label>
            <div className="card-field card-field-with-icons">
              <div id="card-cvv" className="tilled-field"></div>
              <div className="field-icons" style={{ paddingRight: '2px' }}>
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="2" width="22" height="14" rx="2" stroke="#4b5563" strokeWidth="1.5" />
                  <rect x="1" y="5" width="22" height="3" fill="#4b5563" />
                  <text x="11" y="14" fill="#000000" fontFamily="sans-serif" fontSize="6.5" fontWeight="900" letterSpacing="0.5">123</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="card-zip">ZIP Code</label>
          <div className="card-field card-field-with-icons">
            <input
              type="text"
              id="card-zip"
              className="zip-input"
              placeholder="e.g. 80021"
              value={zip}
              maxLength="5"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // strip non-numeric characters
                setZip(val);
              }}
            />
            <div className="field-icons" style={{ paddingRight: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="9" r="2.5" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="pay-button"
          disabled={isLoading || !tilled || !isValid}
        >
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </button>

        <div className="payment-footer">
          <div className="powered-by">
            Secure Payment • Powered by <strong>Tilled</strong>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CardForm;
