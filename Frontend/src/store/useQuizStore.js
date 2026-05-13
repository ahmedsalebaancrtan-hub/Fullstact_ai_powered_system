import { create } from 'zustand';
import api from '../api/axios';

const useQuizStore = create((set) => ({
  currentQuiz: null,
  recentQuizzes: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: null }), // Clear error first, then set if needed

  fetchQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/quizzes');
      // Backend returns data: { is_success: true, data: [quiz1, quiz2, ...] }
      const quizzes = response.data.data || [];
      set({ recentQuizzes: quizzes, isLoading: false });
    } catch (err) {
      const backendError = err.response?.data?.messege || err.response?.data?.error || "Failed to fetch quizzes.";
      set({ error: backendError, isLoading: false });
      
      // Enhanced logging for 404 diagnostics
      console.error("Fetch Quizzes Failed:", {
        message: err.message,
        url: err.config?.url,
        status: err.response?.status
      });
    }
  },
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, isLoading: false, error: null }),
  
  addRecentQuiz: (quiz) => set((state) => ({ 
    recentQuizzes: [quiz, ...state.recentQuizzes]
  })),

  getStats: (state) => {
    const totalQuizzes = state.recentQuizzes.length;
    const uniqueMaterials = new Set(state.recentQuizzes.map(q => q.material_id)).size;
    return {
      totalQuizzes,
      totalMaterials: uniqueMaterials,
      recentActivity: state.recentQuizzes.slice(0, 5)
    };
  },

  fetchQuizById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/quiz/${id}`);
      if (response.data.is_success) {
        set({ currentQuiz: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || "Quiz not found.");
      }
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || "Failed to load quiz.";
      set({ error: backendError, isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));

export default useQuizStore;
