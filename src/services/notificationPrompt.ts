import { STORAGE_KEYS } from '@/src/constants';
import { secureStorage } from '@/src/services/secureStorage';

export async function wasNotificationPromptDismissed(): Promise<boolean> {
  const value = await secureStorage.getItem(STORAGE_KEYS.notificationPromptDismissed);
  return value === '1';
}

export async function dismissNotificationPrompt(): Promise<void> {
  await secureStorage.setItem(STORAGE_KEYS.notificationPromptDismissed, '1');
}
