import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

export async function openInvoiceUrl(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url);
}

export async function startPhoneCall(number: string): Promise<void> {
  const cleaned = number.replace(/[^\d+]/g, '');
  if (!cleaned) {
    throw new Error('CALL_UNAVAILABLE');
  }
  const href = `tel:${cleaned}`;
  const supported = await Linking.canOpenURL(href);
  if (!supported) {
    throw new Error('CALL_UNAVAILABLE');
  }
  await Linking.openURL(href);
}
