import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const groupsService = {
  // Get all groups
  getAll: async () => {
    const response = await apiRequest.get(API_ENDPOINTS.GROUPS);
    return response.data;
  },


  // Create new group
  create: async (groupData) => {
    const response = await apiRequest.post(API_ENDPOINTS.GROUPS, groupData);
    return response.data;
  },

  // Update group
  update: async (groupId, groupData) => {
    const response = await apiRequest.put(`${API_ENDPOINTS.GROUPS}/${groupId}`, groupData);
    return response.data;
  },

  // Delete group
  delete: async (groupId) => {
    const response = await apiRequest.delete(`${API_ENDPOINTS.GROUPS}/${groupId}`);
    return response.data;
  },

  // Group members
  members: {
    // Get all members in group
    getAll: async (groupId) => {
      const response = await apiRequest.get(`${API_ENDPOINTS.GROUPS}/${groupId}/members`);
      return response.data;
    },

    // Add multiple members to group
    addMultiple: async (groupId, profileIds) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.GROUPS}/${groupId}/members`, {
        profile_ids: profileIds
      });
      return response.data;
    },

    // Add single member to group
    addSingle: async (groupId, profileId) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.GROUPS}/${groupId}/members/${profileId}`);
      return response.data;
    },

    // Remove member from group
    remove: async (groupId, profileId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.GROUPS}/${groupId}/members/${profileId}`);
      return response.data;
    }
  }
};