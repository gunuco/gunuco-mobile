import type { AppDispatch } from '@/src/store/store';
import { configApi } from '@/src/store/api/configApi';
import { setAppLifecycle } from '@/src/store/slices/appLifecycleSlice';
import { evaluateAppGate } from '@/src/utils/appConfig';
import { getAppVersion } from '@/src/services/appVersion';

/**
 * Fetch remote lifecycle config. Failure is fail-open: do not assume maintenance.
 */
export async function checkRemoteAppConfig(dispatch: AppDispatch): Promise<void> {
  try {
    const result = await dispatch(
      configApi.endpoints.getAppConfig.initiate(undefined, { forceRefetch: true }),
    );
    if ('error' in result || !result.data) {
      dispatch(
        setAppLifecycle({
          gate: 'none',
          maintenanceMessage: null,
          storeUrl: null,
          configFailed: true,
        }),
      );
      return;
    }
    const decision = evaluateAppGate(result.data, getAppVersion());
    dispatch(
      setAppLifecycle({
        gate: decision.gate,
        maintenanceMessage: decision.maintenanceMessage,
        storeUrl: decision.storeUrl,
        configFailed: false,
      }),
    );
  } catch {
    dispatch(
      setAppLifecycle({
        gate: 'none',
        maintenanceMessage: null,
        storeUrl: null,
        configFailed: true,
      }),
    );
  }
}
