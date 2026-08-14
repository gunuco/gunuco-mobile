import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/src/design-system';

export type ThemePreference = ThemeMode | 'system';

type SettingsState = {
  themePreference: ThemePreference;
  themeHydrated: boolean;
};

const initialState: SettingsState = {
  themePreference: 'system',
  themeHydrated: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    markThemeHydrated(state) {
      state.themeHydrated = true;
    },
  },
});

export const { setThemePreference, markThemeHydrated } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
