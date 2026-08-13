import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from './useAuth';

/**
 * Restores session once on cold start and hides splash when auth status is known.
 */
export function useSessionBootstrap() {
  const { status, bootstrap } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status !== 'unknown') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [status]);

  return { isBootstrapping: status === 'unknown' };
}
