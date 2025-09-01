import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const authService = {
  // Login
  login: async (email, password) => {
    console.log('🔐 Auth: Starting login for:', email);
    try {
      const response = await apiRequest.post(API_ENDPOINTS.LOGIN, {
        email,
        password
      });
      console.log('✅ Auth: Login API response:', response.status, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Auth: Login failed:', error.response?.status, error.response?.data);
      return { success: false, detail: error.response?.data?.detail || 'Login failed' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    console.log('👤 Auth: Getting current user from localStorage:', user);
    const result = user && user !== 'undefined' ? JSON.parse(user) : null;
    console.log('👤 Auth: Parsed user:', result);
    return result;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Store auth data
  setAuthData: (token, user) => {
    console.log('💾 Auth: Storing auth data - token:', !!token, 'user:', user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Change password
  changePassword: async (newPassword) => {
    const response = await apiRequest.patch(API_ENDPOINTS.PASSWORD, {
      new_password: newPassword
    });
    return response.data;
  }
};