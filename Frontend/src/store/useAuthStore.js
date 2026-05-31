import { create } from 'zustand';
import api, { isJsonResponse } from '../api/axios';

export const STUDENT_DASHBOARD_PATH = '/student-dashboard';

const normalizeRole = (user) => (user?.role || user?.Role || 'student').toString().trim().toLowerCase() || 'student';

const getDashboardPathByRole = (user) => {
  const role = normalizeRole(user);
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'teacher') return '/teacher-dashboard';
  return STUDENT_DASHBOARD_PATH;
};

const useAuthStore = create((set, get) => ({
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

  getDashboardPathByRole,

  fetchProfile: async () => {
    try {
      const response = await api.get('/api/user/profile');

      if (!isJsonResponse(response)) {
        return {
          success: false,
          message: 'Profile API returned HTML instead of JSON. Restart the Go backend on port 9090.',
        };
      }

      if (!response.data?.is_success) {
        return {
          success: false,
          message: response.data?.error || response.data?.message || 'Unable to fetch user profile',
        };
      }

      const profile = response.data?.data;
      if (!profile || typeof profile !== 'object') {
        return { success: false, message: 'Profile response is empty' };
      }

      localStorage.setItem('user', JSON.stringify(profile));
      set({ user: profile });
      return { success: true, user: profile };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.response?.data?.messege ||
          error.response?.data?.message ||
          error.message ||
          'Unable to fetch user profile',
      };
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/api/users/login', { 
        emailaddress: email, 
        password 
      });

      if (!isJsonResponse(response)) {
        return {
          success: false,
          message: 'Login API returned HTML instead of JSON. Ensure the Go backend is running on port 9090.',
        };
      }

      const payload = response.data?.data;
      const accessToken =
        payload?.Access_token || payload?.access_token || payload?.accessToken;

      if (!accessToken) {
        return {
          success: false,
          message: response.data?.message || 'Invalid login response from server',
        };
      }

      const User = payload?.User || payload?.user;
      
      // ── Persist both token AND user object so refreshes survive ────────────
      localStorage.setItem('token', accessToken);
      if (User) {
        localStorage.setItem('user', JSON.stringify(User));
      } else {
        localStorage.removeItem('user');
      }
      // ───────────────────────────────────────────────────────────────────────
      
      set({ token: accessToken, user: User || null });
      return { success: true, user: User || null };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.error || 'Invalid email or password' 
      };
    }
  },

  register: async (userData) => {
    try {
      const payload = {
        ...userData,
        ...(userData.role ? { role: userData.role } : {}),
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

      if (!token) {
        const loginResult = await get().login(userData.email, userData.password);
        return {
          ...loginResult,
          status: response.status,
          redirectPath: getDashboardPathByRole(loginResult.user),
        };
      }

      return { 
        success: true, 
        status: response.status,
        token: token,
        redirectPath: getDashboardPathByRole(user),
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
