import { apiRequest, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const analyticsService = {
  // Get dashboard analytics
  getDashboard: async () => {
    const response = await apiRequest.get(API_ENDPOINTS.DASHBOARD);
    return response.data;
  },

  // Get detailed analytics overview
  getOverview: async () => {
    const response = await apiRequest.get(API_ENDPOINTS.ANALYTICS);
    return response.data;
  },

  // Get payments history
  getPayments: async (page = 1, size = 20) => {
    const response = await apiRequest.get(API_ENDPOINTS.PAYMENTS, { page, size });
    return response.data;
  },

  // Center management
  center: {
    // Get center info
    getInfo: async () => {
      const response = await apiRequest.get(API_ENDPOINTS.CENTER_INFO);
      return response.data;
    },

    // Update center
    update: async (centerData) => {
      const response = await apiRequest.patch(API_ENDPOINTS.CENTER_UPDATE, centerData);
      return response.data;
    },

    // Upload center logo
    uploadLogo: async (logoFile) => {
      const response = await uploadFile(API_ENDPOINTS.CENTER_LOGO, logoFile);
      return response.data;
    }
  }
};