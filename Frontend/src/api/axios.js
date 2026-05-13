import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9090',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    // Pull the latest token from localStorage right before the call
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

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auth Rejection: If the backend returns a 401, check if we should redirect
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      
      // Only redirect if token is truly missing or if the backend explicitly says it's expired/invalid
      if (!token || error.response.data?.error?.includes('token') || error.response.data?.messege?.includes('Unauthorized')) {
        console.warn('Unauthorized! Redirecting to login...');
        localStorage.removeItem('token');
        // Prevent infinite loops if already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Global Diagnostics: Log the full error response for development
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.messege || error.response.data?.error
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
