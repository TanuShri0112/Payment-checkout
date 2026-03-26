// Navigation state management utilities
// Provides robust state persistence with sessionStorage fallback

const STATE_KEY = 'payment_navigation_state';
const STATE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const saveNavigationState = (state) => {
  try {
    const stateData = {
      ...state,
      timestamp: Date.now(),
      expiry: Date.now() + STATE_EXPIRY
    };
    sessionStorage.setItem(STATE_KEY, JSON.stringify(stateData));
  } catch (error) {
    console.warn('Failed to save navigation state:', error);
  }
};

export const getNavigationState = () => {
  try {
    const stored = sessionStorage.getItem(STATE_KEY);
    if (!stored) return null;

    const stateData = JSON.parse(stored);
    
    // Check if state has expired
    if (Date.now() > stateData.expiry) {
      sessionStorage.removeItem(STATE_KEY);
      return null;
    }

    return stateData;
  } catch (error) {
    console.warn('Failed to retrieve navigation state:', error);
    return null;
  }
};

export const clearNavigationState = () => {
  try {
    sessionStorage.removeItem(STATE_KEY);
  } catch (error) {
    console.warn('Failed to clear navigation state:', error);
  }
};

export const validatePaymentState = (routerState, requiredFields = ['fromPaymentProcess']) => {
  // First check router state
  if (routerState && requiredFields.every(field => routerState[field] !== undefined)) {
    return { valid: true, source: 'router', data: routerState };
  }

  // Fallback to sessionStorage
  const storedState = getNavigationState();
  if (storedState && requiredFields.every(field => storedState[field] !== undefined)) {
    return { valid: true, source: 'session', data: storedState };
  }

  return { valid: false, source: null, data: null };
};
