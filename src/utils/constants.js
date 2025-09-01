export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  GROUPS: '/groups',
  COURSES: '/courses',
  MODULES: '/modules',
  LESSONS: '/lessons',
  WORDS: '/words',
  ANALYTICS: '/analytics',
  PAYMENTS: '/payments',
  CENTER: '/center'
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  
  // Dashboard
  DASHBOARD: '/admin/dashboard',
  
  // Users
  STUDENTS: '/admin/users/students',
  TEACHERS: '/admin/users/teachers',
  
  // Groups
  GROUPS: '/admin/groups',
  
  // Courses
  COURSES: '/admin/courses',
  MODULES: '/admin/modules',
  LESSONS: '/admin/lessons',
  WORDS: '/admin/words',
  
  // Analytics
  ANALYTICS: '/admin/analytics/overview',
  
  // Payments
  PAYMENTS: '/admin/payments',
  
  // Center
  CENTER_INFO: '/admin/center/info',
  CENTER_UPDATE: '/admin/center',
  CENTER_LOGO: '/admin/center/logo',
  
  // Password
  PASSWORD: '/admin/password'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20
};

export const FILE_TYPES = {
  IMAGES: ['image/png', 'image/jpg', 'image/jpeg'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/mpeg']
};