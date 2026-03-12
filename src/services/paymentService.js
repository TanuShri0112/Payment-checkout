import axios from 'axios';

/**
 * Service to handle payment-related API calls
 */

/**
 * Fetch checkout session data from backend API
 * @param {string} sessionId - The session ID to fetch
 * @returns {Promise<Object>} The checkout session data
 */
export const getCheckoutSession = async (sessionId) => {
  try {
    const response = await axios.get(`/api/checkout-session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching checkout session:', error);
    throw error;
  }
};
