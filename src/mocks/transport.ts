import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { handleMockRequest } from './handlers';
import { getUiTestLatencyMs, getUiTestNetwork } from './scenarios';

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * RTK Query baseQuery that never touches the network.
 * Selected only when EXPO_PUBLIC_UI_TEST_MODE=true.
 */
export const uiTestBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  if (getUiTestNetwork() === 'OFFLINE') {
    await delay(200);
    return { error: { status: 'FETCH_ERROR', error: 'Network request failed' } };
  }

  await delay(getUiTestLatencyMs());
  const result = handleMockRequest(args);
  if ('error' in result) {
    return { error: result.error as FetchBaseQueryError };
  }
  return { data: result.data };
};
