/**
 * Utility function to extract session_id from URL query parameters
 * @returns {string|null} The session ID from URL or null if not found
 */
export const getSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('session_id');
};
