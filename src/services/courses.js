import { apiRequest, uploadFile } from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const coursesService = {
  // Courses
  courses: {
    // Get all courses
    getAll: async () => {
      const response = await apiRequest.get(API_ENDPOINTS.COURSES);
      return response.data;
    },

    // Create new course
    create: async (courseData) => {
      const response = await apiRequest.post(API_ENDPOINTS.COURSES, courseData);
      return response.data;
    },

    // Update course
    update: async (courseId, courseData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.COURSES}/${courseId}`, courseData);
      return response.data;
    },

    // Delete course
    delete: async (courseId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.COURSES}/${courseId}`);
      return response.data;
    }
  },

  // Modules
  modules: {
    // Get all modules in course
    getByCourse: async (courseId) => {
      const response = await apiRequest.get(`${API_ENDPOINTS.COURSES}/${courseId}/modules`);
      return response.data;
    },

    // Create new module
    create: async (courseId, moduleData) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.COURSES}/${courseId}/modules`, moduleData);
      return response.data;
    },

    // Update module
    update: async (moduleId, moduleData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.MODULES}/${moduleId}`, moduleData);
      return response.data;
    },

    // Delete module
    delete: async (moduleId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.MODULES}/${moduleId}`);
      return response.data;
    }
  },

  // Lessons
  lessons: {
    // Get all lessons in module
    getByModule: async (moduleId) => {
      const response = await apiRequest.get(`${API_ENDPOINTS.MODULES}/${moduleId}/lessons`);
      return response.data;
    },

    // Create new lesson
    create: async (moduleId, lessonData) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.MODULES}/${moduleId}/lessons`, lessonData);
      return response.data;
    },

    // Update lesson
    update: async (lessonId, lessonData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.LESSONS}/${lessonId}`, lessonData);
      return response.data;
    },

    // Delete lesson
    delete: async (lessonId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.LESSONS}/${lessonId}`);
      return response.data;
    }
  },

  // Words
  words: {
    // Get all words in lesson
    getByLesson: async (lessonId) => {
      const response = await apiRequest.get(`${API_ENDPOINTS.LESSONS}/${lessonId}/words`);
      return response.data;
    },

    // Add single word to lesson
    create: async (lessonId, wordData) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.LESSONS}/${lessonId}/words`, wordData);
      return response.data;
    },

    // Add multiple words to lesson
    createBulk: async (lessonId, wordsData) => {
      const response = await apiRequest.post(`${API_ENDPOINTS.LESSONS}/${lessonId}/words/bulk`, {
        words: wordsData
      });
      return response.data;
    },

    // Update word
    update: async (wordId, wordData) => {
      const response = await apiRequest.put(`${API_ENDPOINTS.WORDS}/${wordId}`, wordData);
      return response.data;
    },

    // Delete word
    delete: async (wordId) => {
      const response = await apiRequest.delete(`${API_ENDPOINTS.WORDS}/${wordId}`);
      return response.data;
    },

    // Upload word image
    uploadImage: async (wordId, imageFile) => {
      const response = await uploadFile(`${API_ENDPOINTS.WORDS}/${wordId}/image`, imageFile);
      return response.data;
    },

    // Upload word audio
    uploadAudio: async (wordId, audioFile) => {
      const response = await uploadFile(`${API_ENDPOINTS.WORDS}/${wordId}/audio`, audioFile);
      return response.data;
    }
  }
};