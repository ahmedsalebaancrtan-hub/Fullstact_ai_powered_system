import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  // ── Session Hydration ──────────────────────────────────────────────────────
  // Parse the persisted user from localStorage at store-init time.
  // This is what survives a hard refresh — no user = blank role = broken UI.
  user: (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  })(),
  // ───────────────────────────────────────────────────────────────────────────

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUser: (user) => {
    // Keep localStorage in sync when user is set externally
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/api/users/login', { 
        emailaddress: email, 
        password 
      });
      // Backend returns data: { Access_token, User, ... }
      const { Access_token, User } = response.data.data;
      
      // ── Persist both token AND user object so refreshes survive ────────────
      localStorage.setItem('token', Access_token);
      localStorage.setItem('user', JSON.stringify(User));
      // ───────────────────────────────────────────────────────────────────────
      
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
        // ── Persist both token AND user object ─────────────────────────────
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // ───────────────────────────────────────────────────────────────────
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
    // ── Clear ALL persisted auth data ────────────────────────────────────────
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ─────────────────────────────────────────────────────────────────────────
    set({ token: null, user: null });
    window.location.href = '/login';
  },
}));

export default useAuthStore;
