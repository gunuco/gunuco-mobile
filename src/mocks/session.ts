import type { AppDispatch } from '@/src/store/store';
import { baseApi } from '@/src/store/api/baseApi';
import { setAuthenticated, setUnauthenticated } from '@/src/store/slices/authSlice';
import { persistSessionTokens } from '@/src/services/session';
import { checkRemoteAppConfig } from '@/src/services/appConfig';
import { clearInMemoryCustomerState } from '@/src/services/clearCustomerState';
import { secureStorage } from '@/src/services/secureStorage';
import {
  UI_TEST_CUSTOMERS,
  accessTokenFor,
  refreshTokenFor,
  type UiTestCustomerId,
} from './scenarios';
import { setCurrentCustomerId, logoutMockSession } from './repository';

export async function applyUiTestCustomer(
  dispatch: AppDispatch,
  customerId: UiTestCustomerId,
): Promise<void> {
  setCurrentCustomerId(customerId);
  const profile = UI_TEST_CUSTOMERS[customerId];
  await persistSessionTokens({
    accessToken: accessTokenFor(customerId),
    refreshToken: refreshTokenFor(customerId),
  });
  dispatch(baseApi.util.resetApiState());
  dispatch(
    setAuthenticated({
      customerId: profile.customerId,
      phone: profile.phone,
      name: profile.name,
    }),
  );
}

export async function signOutUiTestCustomer(dispatch: AppDispatch): Promise<void> {
  logoutMockSession();
  clearInMemoryCustomerState();
  await secureStorage.clearAuthTokens();
  dispatch(setUnauthenticated());
  dispatch(baseApi.util.resetApiState());
}

export async function applyUiTestScenarioSideEffects(dispatch: AppDispatch): Promise<void> {
  dispatch(baseApi.util.resetApiState());
  await checkRemoteAppConfig(dispatch);
}
