import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';

// Lazy load components
const GetStartedPage = lazy(() => import('./pages/GetStartedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const QuizViewPage = lazy(() => import('./pages/QuizViewPage'));
const ActiveQuizPage = lazy(() => import('./pages/ActiveQuizPage'));
const TeacherAnalyticsModule = lazy(() => import('./pages/TeacherAnalyticsModule'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

import RoleGuard from './components/RoleGuard';

// Protected Route Wrapper - Ensures users cannot access core workspaces without proper intent (authentication)
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <Routes>
          {/* Absolute Entry Point - System MUST boot here */}
          <Route path="/" element={<GetStartedPage />} />
          
          {/* Authentication Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Core Workspaces */}
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/quiz-view/:id" element={<QuizViewPage />} />
            <Route path="/active-quiz/:id" element={<ActiveQuizPage />} />
            <Route path="/analytics" element={<TeacherAnalyticsModule />} />
          </Route>

          {/* Admin Workspace */}
          <Route 
            element={
              <ProtectedRoute>
                <RoleGuard behavior="redirect" allowedRoles={['admin']}>
                  <AdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Global Catch-all to force Get Started entry */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
