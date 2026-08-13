import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { applyAuthenticatedSession, logoutSession, restoreSession } from '@/src/services/session';
import { dismissSessionExpired } from '@/src/store/slices/authSlice';
import type { OtpVerifyResponse } from '@/src/types/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const completeLogin = useCallback(
    async (payload: OtpVerifyResponse) => {
      await applyAuthenticatedSession(dispatch, payload);
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await logoutSession(dispatch);
    dispatch(dismissSessionExpired());
  }, [dispatch]);

  const bootstrap = useCallback(async () => {
    await restoreSession(dispatch);
  }, [dispatch]);

  const dismissExpired = useCallback(() => {
    dispatch(dismissSessionExpired());
  }, [dispatch]);

  return {
    status: auth.status,
    customerId: auth.customerId,
    phone: auth.phone,
    name: auth.name,
    isAuthenticated: auth.status === 'authenticated',
    isGuest: auth.status === 'unauthenticated',
    isBootstrapping: auth.status === 'unknown',
    sessionExpiredVisible: auth.sessionExpiredVisible,
    completeLogin,
    logout,
    bootstrap,
    dismissExpired,
  };
}
