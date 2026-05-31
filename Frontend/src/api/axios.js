import axios from 'axios';

const resolveBaseURL = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return configured;
  // Dev: same-origin + Vite proxy (/api -> localhost:9090)
  if (import.meta.env.DEV) return '';
  return 'http://localhost:9090';
};

export const isJsonResponse = (response) => {
  const data = response?.data;
  if (typeof data === 'string' && data.trim().startsWith('<!')) return false;
  if (data && typeof data === 'object') return true;
  const contentType = response?.headers?.['content-type'] || '';
  return contentType.includes('application/json');
};

const api = axios.create({
  baseURL: resolveBaseURL(),
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
    if (error.response?.status === 401) {
      const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
      const token = localStorage.getItem('token');

      // Do not wipe session during login/profile hydration on auth pages
      if (!onAuthPage && token) {
        console.warn('Session expired. Redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
