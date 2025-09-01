import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    if (isAuthenticated && currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { access_token, user: userData } = response.data;
        authService.setAuthData(access_token, userData);
        setUser(userData);
        return { success: true };
      }
      
      return { success: false, error: response.detail || 'Login failed' };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const changePassword = async (newPassword) => {
    try {
      const response = await authService.changePassword(newPassword);
      return { success: true, message: response.data?.message };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};