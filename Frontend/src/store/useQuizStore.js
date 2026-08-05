import { create } from 'zustand';
import api from '../api/axios';
import { fetchQuiz, fetchStudentQuizzes, fetchTeacherQuizzes, publishQuiz } from '../api/quizzes';

const useQuizStore = create((set) => ({
  currentQuiz: null,
  recentQuizzes: [],
  myResults: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const quizzes = await fetchTeacherQuizzes();
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

  fetchAvailableQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const quizzes = await fetchStudentQuizzes();
      set({ recentQuizzes: quizzes, isLoading: false });
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || "Failed to fetch student quizzes.";
      set({ error: backendError, isLoading: false });
    }
  },

  fetchMyResults: async () => {
    try {
      const response = await api.get('/api/quiz/my-results');
      // ── Diagnostic log — verify backend payload in DevTools console ─────────
      console.log('[fetchMyResults] Raw API response:', response.data);
      // ─────────────────────────────────────────────────────────────────────────

      const results = response.data?.data || [];
      console.log('[fetchMyResults] Parsed results array:', results);
      set({ myResults: results });
    } catch (err) {
      console.error('[fetchMyResults] Failed to fetch student results:', err);
      console.error('[fetchMyResults] Response data:', err.response?.data);
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
      const quiz = await fetchQuiz(id);
      if (!quiz) throw new Error("Quiz not found.");
      set({ currentQuiz: quiz, isLoading: false });
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || "Failed to load quiz.";
      set({ error: backendError, isLoading: false });
    }
  },

  publishQuizById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await publishQuiz(id);
      set((state) => ({
        currentQuiz: String(state.currentQuiz?.id) === String(id)
          ? { ...state.currentQuiz, status: 'PUBLISHED' }
          : state.currentQuiz,
        recentQuizzes: state.recentQuizzes.map((quiz) =>
          String(quiz.id) === String(id) ? { ...quiz, status: 'PUBLISHED' } : quiz
        ),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.error || "Failed to publish quiz.";
      set({ error: backendError, isLoading: false });
      return { success: false, error: backendError };
    }
  },

  clearError: () => set({ error: null })
}));

export default useQuizStore;
