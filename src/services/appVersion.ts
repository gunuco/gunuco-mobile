import Constants from 'expo-constants';

/** App version from Expo metadata — never a hard-coded screen constant. */
export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.0';
}
