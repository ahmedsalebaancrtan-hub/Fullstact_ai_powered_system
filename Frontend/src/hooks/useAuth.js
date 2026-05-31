import { useCallback, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

export default function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const loginAction = useAuthStore((state) => state.login);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const getDashboardPathByRole = useAuthStore((state) => state.getDashboardPathByRole);

  const resolveDashboardPath = useCallback(
    (targetUser = user) => getDashboardPathByRole(targetUser),
    [getDashboardPathByRole, user]
  );

  const login = useCallback(
    async (email, password) => {
      const loginResult = await loginAction(email, password);
      if (!loginResult.success) return loginResult;

      const profileResult = await fetchProfile();
      const resolvedUser = profileResult.success ? profileResult.user : loginResult.user;
      const redirectPath = getDashboardPathByRole(resolvedUser);

      return {
        success: true,
        user: resolvedUser || null,
        redirectPath,
        profileFetched: profileResult.success,
        profileError: profileResult.success ? null : profileResult.message,
      };
    },
    [fetchProfile, getDashboardPathByRole, loginAction]
  );

  const loginAndRedirect = useCallback(
    async (email, password, navigate) => {
      const result = await login(email, password);
      if (result.success && typeof navigate === 'function') {
        navigate(result.redirectPath || getDashboardPathByRole(result.user), { replace: true });
      }
      return result;
    },
    [getDashboardPathByRole, login]
  );

  useEffect(() => {
    if (!token || user) return;
    fetchProfile();
  }, [token, user, fetchProfile]);

  return {
    token,
    user,
    login,
    loginAndRedirect,
    fetchProfile,
    resolveDashboardPath,
  };
}
