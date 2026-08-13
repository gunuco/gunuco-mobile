import { Redirect } from 'expo-router';

/** App entry — guest browsing allowed; session restore happens in root layout. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
