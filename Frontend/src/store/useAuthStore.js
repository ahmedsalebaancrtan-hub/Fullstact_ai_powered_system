import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    try {
      const response = await api.post('/api/users/login', { 
        emailaddress: email, 
        password 
      });
      // Backend returns data: { Access_token, User, ... }
      const { Access_token, User } = response.data.data;
      
      localStorage.setItem('token', Access_token);
      set({ token: Access_token, user: User });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Invalid email or password' 
      };
    }
  },

  register: async (userData) => {
    try {
      const payload = {
        ...userData,
        role: userData.role || 'TEACHER'
      };
      const response = await api.post('/api/users/create', payload);
      
      console.log("Backend Response:", response.data);
      
      // If backend returns a token on registration (auto-login)
      const token = response.data?.data?.Access_token;
      const user = response.data?.data?.User;
      
      if (token && user) {
        localStorage.setItem('token', token);
        set({ token, user });
      }

      return { 
        success: true, 
        status: response.status,
        token: token 
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.log("Error Response Data:", error.response.data);
      }
      return { 
        success: false, 
        status: error.response?.status,
        message: error.response?.data?.messege || error.response?.data?.error || 'Failed to create account' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
    window.location.href = '/login';
  },
}));

export default useAuthStore;
