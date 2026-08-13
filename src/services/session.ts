import type { AppDispatch } from '@/src/store/store';
import { authApi } from '@/src/store/api/authApi';
import { baseApi } from '@/src/store/api/baseApi';
import { setAuthenticated, setUnauthenticated } from '@/src/store/slices/authSlice';
import { secureStorage } from '@/src/services/secureStorage';
import type { Customer, OtpVerifyResponse } from '@/src/types/auth';

function mapCustomer(customer: Customer) {
  return {
    customerId: customer.customerId,
    phone: customer.phone,
    name: customer.name ?? null,
  };
}

export async function persistSessionTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  await Promise.all([
    secureStorage.setAccessToken(tokens.accessToken),
    secureStorage.setRefreshToken(tokens.refreshToken),
  ]);
}

export async function applyAuthenticatedSession(
  dispatch: AppDispatch,
  payload: OtpVerifyResponse,
): Promise<void> {
  await persistSessionTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  dispatch(setAuthenticated(mapCustomer(payload.customer)));
}

export async function clearSession(dispatch: AppDispatch): Promise<void> {
  await secureStorage.clearAuthTokens();
  dispatch(setUnauthenticated());
  dispatch(baseApi.util.resetApiState());
}

/**
 * Cold-start session restore:
 * refresh token present → refresh → load customer profile.
 * Never logs token values.
 */
export async function restoreSession(dispatch: AppDispatch): Promise<void> {
  const refreshToken = await secureStorage.getRefreshToken();
  const accessToken = await secureStorage.getAccessToken();

  if (!refreshToken && !accessToken) {
    dispatch(setUnauthenticated());
    return;
  }

  try {
    if (refreshToken) {
      const refreshResult = await dispatch(
        authApi.endpoints.refreshToken.initiate({ refreshToken }),
      );

      if ('error' in refreshResult || !refreshResult.data) {
        await clearSession(dispatch);
        return;
      }

      await persistSessionTokens(refreshResult.data);
    }

    const meResult = await dispatch(authApi.endpoints.getMe.initiate());
    if ('error' in meResult || !meResult.data) {
      await clearSession(dispatch);
      return;
    }

    dispatch(setAuthenticated(mapCustomer(meResult.data)));
  } catch {
    await clearSession(dispatch);
  }
}

export async function logoutSession(dispatch: AppDispatch): Promise<void> {
  const refreshToken = (await secureStorage.getRefreshToken()) ?? undefined;
  try {
    await dispatch(authApi.endpoints.logout.initiate({ refreshToken }));
  } catch {
    // Always clear local session even if logout API fails.
  } finally {
    await clearSession(dispatch);
  }
}
