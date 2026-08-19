import React from 'react';
import { OrdersListView } from '@/src/components';

export default function ReorderTabScreen() {
  return (
    <OrdersListView
      title="Reorder"
      showHeaderActions
      defaultGroup="past"
      groups={['past']}
      emptyPast={{
        title: 'Nothing to reorder yet',
        description: 'Completed bakery orders will show here so you can add them to cart again.',
      }}
    />
  );
}
