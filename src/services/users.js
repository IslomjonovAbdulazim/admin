import { apiRequest } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const usersService = {
  // Students
  students: {
    // Get all students with pagination and search
    getAll: async (page = 1, size = 20, search = '') => {
      const params = { page, size };
      if (search) params.search = search;
      const response = await apiRequest.get(API_ENDPOINTS.STUDENTS, params);
      return response.data;
    },

    // Create new student
    create: async (studentData) => {
      const response = await apiRequest.post(API_ENDPOINTS.STUDENTS, studentData);
      return response.data;
    },

    // Update student
    update: async (profileId, studentData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.STUDENTS}/${profileId}`, studentData);
      return response.data;
    },

    // Delete student
    delete: async (profileId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.STUDENTS}/${profileId}`);
      return response.data;
    }
  },

  // Teachers
  teachers: {
    // Get all teachers
    getAll: async () => {
      const response = await apiRequest.get(API_ENDPOINTS.TEACHERS);
      return response.data;
    },

    // Create new teacher
    create: async (teacherData) => {
      const response = await apiRequest.post(API_ENDPOINTS.TEACHERS, teacherData);
      return response.data;
    },

    // Update teacher
    update: async (profileId, teacherData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.TEACHERS}/${profileId}`, teacherData);
      return response.data;
    },

    // Delete teacher
    delete: async (profileId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.TEACHERS}/${profileId}`);
      return response.data;
    }
  }
};