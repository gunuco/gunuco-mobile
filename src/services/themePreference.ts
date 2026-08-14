import type { AppDispatch } from '@/src/store/store';
import {
  markThemeHydrated,
  setThemePreference,
  type ThemePreference,
} from '@/src/store/slices/settingsSlice';
import { STORAGE_KEYS } from '@/src/constants';
import { secureStorage } from '@/src/services/secureStorage';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Persist + apply theme. Preference is not sensitive; SecureStore is already the app store. */
export async function persistThemePreference(
  dispatch: AppDispatch,
  preference: ThemePreference,
): Promise<void> {
  dispatch(setThemePreference(preference));
  await secureStorage.setItem(STORAGE_KEYS.themePreference, preference);
}

export async function restoreThemePreference(dispatch: AppDispatch): Promise<void> {
  const stored = await secureStorage.getItem(STORAGE_KEYS.themePreference);
  if (isThemePreference(stored)) {
    dispatch(setThemePreference(stored));
  }
  dispatch(markThemeHydrated());
}
