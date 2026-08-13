import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from '@/src/design-system';
import { useAppSelector } from '@/src/store';

const ThemeContext = createContext<AppTheme>(lightTheme);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const preference = useAppSelector((state) => state.settings.themePreference);

  const theme = useMemo<AppTheme>(() => {
    const resolved: ThemeMode =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
