import axios from 'axios';

// Dummy URL for now as per requirements
const BASE_URL = 'https://example.com/api';

/**
 * Registers a new user.
 * 
 * @param {Object} data - The registration payload (name, email, password, profileImage, etc.)
 * @returns {Promise<Object>} The server response data
 */
export const registerUser = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, data);
    return response.data;
  } catch (error) {
    console.error('Error during registration API call:', error);
    throw error; // Let the caller component handle the UI error logic
  }
};
