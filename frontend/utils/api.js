// Choose the appropriate API URL based on your environment
const API_BASE_URL = __DEV__
  ? "http://10.124.170.141:5000"  // Local development server IP
  : "http://10.124.170.141:5000"; // Production server

// Remove trailing slash if present
if (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

// Export API URL and helper functions
export const checkApiConnection = async () => {
  try {
    console.log('Checking API connection to:', API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/`);
    console.log('API response status:', response.status);
    
    const text = await response.text();
    console.log('API response text:', text);
    
    if (text.includes('<!DOCTYPE html>')) {
      console.error('API is returning HTML instead of JSON');
      return false;
    }
    
    try {
      const json = JSON.parse(text);
      console.log('API is accessible:', json);
      return true;
    } catch (parseError) {
      console.error('API response is not valid JSON:', parseError);
      return false;
    }
  } catch (error) {
    console.error('API Connection Error:', error);
    return false;
  }
};

export default API_BASE_URL;
