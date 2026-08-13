/**
 * OS-backed secure storage abstraction for auth/session secrets.
 * Never log token values.
 */

import * as SecureStore from 'expo-secure-store';

const AUTH_ACCESS_TOKEN_KEY = 'gunuco.auth.accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'gunuco.auth.refreshToken';

async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = {
  setItem,
  getItem,
  deleteItem,
  async setAccessToken(token: string): Promise<void> {
    await setItem(AUTH_ACCESS_TOKEN_KEY, token);
  },
  async getAccessToken(): Promise<string | null> {
    return getItem(AUTH_ACCESS_TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    await setItem(AUTH_REFRESH_TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return getItem(AUTH_REFRESH_TOKEN_KEY);
  },
  async clearAuthTokens(): Promise<void> {
    await Promise.all([deleteItem(AUTH_ACCESS_TOKEN_KEY), deleteItem(AUTH_REFRESH_TOKEN_KEY)]);
  },
};

export type SecureStorage = typeof secureStorage;
