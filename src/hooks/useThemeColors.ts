import { useTheme } from '@/src/providers';

export function useThemeColors() {
  return useTheme().colors;
}
