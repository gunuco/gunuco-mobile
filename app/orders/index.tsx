import { Redirect } from 'expo-router';
import { ordersHref } from '@/src/utils/navigation';

export default function OrdersIndexRedirect() {
  return <Redirect href={ordersHref()} />;
}
