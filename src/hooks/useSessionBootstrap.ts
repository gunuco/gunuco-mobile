import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAppSelector } from '@/src/store/hooks';
import { useAuth } from './useAuth';

/**
 * Restores theme + remote config + session once on cold start and hides splash when ready.
 * Theme is restored first so maintenance/force-update screens can use design tokens.
 * Config failure is fail-open and never assumes maintenance.
 */
export function useSessionBootstrap() {
  const { status, bootstrap } = useAuth();
  const themeHydrated = useAppSelector((state) => state.settings.themeHydrated);
  const configChecked = useAppSelector((state) => state.appLifecycle.configChecked);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    void bootstrap();
  }, [bootstrap]);

  const isBootstrapping = status === 'unknown' || !themeHydrated || !configChecked;

  useEffect(() => {
    if (!isBootstrapping) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isBootstrapping]);

  return { isBootstrapping };
}
