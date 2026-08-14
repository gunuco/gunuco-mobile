import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAppSelector } from '@/src/store/hooks';
import { useAuth } from './useAuth';

/**
 * Restores theme + session once on cold start and hides splash when both are ready.
 */
export function useSessionBootstrap() {
  const { status, bootstrap } = useAuth();
  const themeHydrated = useAppSelector((state) => state.settings.themeHydrated);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    void bootstrap();
  }, [bootstrap]);

  const isBootstrapping = status === 'unknown' || !themeHydrated;

  useEffect(() => {
    if (!isBootstrapping) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isBootstrapping]);

  return { isBootstrapping };
}
