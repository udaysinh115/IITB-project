import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;
        
        // Update the token
        localStorage.setItem('token', token);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle different error status codes
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    
    switch (error.response?.status) {
      case 400:
        toast.error(errorMessage);
        break;
      case 401:
        toast.error('Please login to continue');
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(errorMessage);
        }
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),

  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
  },

  // Users
  users: {
    getStudents: (schoolId, params = {}) => api.get(`/Students/${schoolId}`, { params }),
    getStudent: (id) => api.get(`/Student/${id}`),
    updateStudent: (id, data) => api.put(`/Student/${id}`, data),
    deleteStudent: (id) => api.delete(`/Student/${id}`),
    
    getTeachers: (schoolId, params = {}) => api.get(`/Teachers/${schoolId}`, { params }),
    getTeacher: (id) => api.get(`/Teacher/${id}`),
    updateTeacher: (id, data) => api.put(`/Teacher/${id}`, data),
    deleteTeacher: (id) => api.delete(`/Teacher/${id}`),
    
    getAvailableTeachers: (params = {}) => api.get('/teachers/available', { params }),
  },

  // Classes and Subjects
  classes: {
    getAll: (schoolId) => api.get(`/SclassList/${schoolId}`),
    getDetails: (id) => api.get(`/Sclass/${id}`),
    create: (data) => api.post('/SclassCreate', data),
    delete: (id) => api.delete(`/Sclass/${id}`),
  },

  subjects: {
    getAll: (schoolId) => api.get(`/AllSubjects/${schoolId}`),
    getByClass: (classId) => api.get(`/ClassSubjects/${classId}`),
    getDetails: (id) => api.get(`/Subject/${id}`),
    create: (data) => api.post('/SubjectCreate', data),
    delete: (id) => api.delete(`/Subject/${id}`),
  },

  // Messaging
  messages: {
    getConversations: (params = {}) => api.get('/conversations', { params }),
    createConversation: (data) => api.post('/conversations', data),
    getMessages: (conversationId, params = {}) => api.get(`/conversations/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, data) => api.post(`/conversations/${conversationId}/messages`, data),
    editMessage: (messageId, data) => api.put(`/messages/${messageId}`, data),
    deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
    markAsRead: (conversationId) => api.put(`/conversations/${conversationId}/read`),
    search: (params) => api.get('/messages/search', { params }),
    getStats: () => api.get('/messages/stats'),
  },

  // Notifications
  notifications: {
    getAll: (params = {}) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    delete: (id) => api.delete(`/notifications/${id}`),
    create: (data) => api.post('/notifications', data),
    broadcast: (data) => api.post('/notifications/broadcast', data),
    getStats: () => api.get('/notifications/stats'),
  },

  // Complaints
  complaints: {
    getAll: (schoolId, params = {}) => api.get(`/ComplainList/${schoolId}`, { params }),
    create: (data) => api.post('/ComplainCreate', data),
    getDetails: (id) => api.get(`/Complain/${id}`),
    updateStatus: (id, data) => api.put(`/Complain/${id}/status`, data),
    addResponse: (id, data) => api.post(`/Complain/${id}/response`, data),
  },

  // Notices
  notices: {
    getAll: (schoolId) => api.get(`/NoticeList/${schoolId}`),
    create: (data) => api.post('/NoticeCreate', data),
    update: (id, data) => api.put(`/Notice/${id}`, data),
    delete: (id) => api.delete(`/Notice/${id}`),
  },

  // Performance and Analytics
  performance: {
    getStudentPerformance: (studentId) => api.get(`/ParentStudentPerformance/${studentId}`),
    updateExamResult: (studentId, data) => api.put(`/UpdateExamResult/${studentId}`, data),
    getAttendance: (studentId) => api.get(`/StudentAttendance/${studentId}`),
    updateAttendance: (studentId, data) => api.put(`/StudentAttendance/${studentId}`, data),
  },

  // Health check
  health: () => api.get('/health'),
};

export default api;