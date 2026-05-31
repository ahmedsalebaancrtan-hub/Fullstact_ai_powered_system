import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore, { STUDENT_DASHBOARD_PATH } from '../store/useAuthStore';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  behavior?: 'hide' | 'redirect';
  fallbackRedirect?: string;
}

/**
 * RoleGuard secures both route trees and specific UI components.
 * Supports TypeScript and integrates seamlessly with zustand auth store.
 */
export default function RoleGuard({
  children,
  allowedRoles = ['admin'],
  behavior = 'hide',
  fallbackRedirect = STUDENT_DASHBOARD_PATH,
}: RoleGuardProps) {
  const { user, token } = useAuthStore() as {
    user: { role?: string; Role?: string; full_name?: string; email?: string } | null;
    token: string | null;
  };
  const location = useLocation();

  // If there's no auth token, redirect to login if it's a route guard, otherwise hide
  if (!token) {
    if (behavior === 'redirect') {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return null;
  }

  const role = (user?.role || user?.Role || 'student').toLowerCase() || 'student';
  const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(role);

  if (!isAllowed) {
    if (behavior === 'redirect') {
      return <Navigate to={fallbackRedirect} state={{ from: location }} replace />;
    }
    return null;
  }

  return <>{children}</>;
}
