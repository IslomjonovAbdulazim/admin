import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiRequest.post(API_ENDPOINTS.LOGIN, {
      email,
      password
    });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Store auth data
  setAuthData: (token, user) => {
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