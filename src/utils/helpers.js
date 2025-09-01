// Format date to readable format
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone;
};

// Validate Uzbekistan phone number
export const isValidUzbekPhone = (phone) => {
  const uzbekPhoneRegex = /^\+998[0-9]{9}$/;
  return uzbekPhoneRegex.test(phone);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong';
};

// Debounce function for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Check if file is valid image
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return file && validTypes.includes(file.type);
};

// Check if file is valid audio
export const isValidAudio = (file) => {
  const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg'];
  return file && validTypes.includes(file.type);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};