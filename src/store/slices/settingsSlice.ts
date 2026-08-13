import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/src/design-system';

export type ThemePreference = ThemeMode | 'system';

type SettingsState = {
  themePreference: ThemePreference;
};

const initialState: SettingsState = {
  themePreference: 'system',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
  },
});

export const { setThemePreference } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
