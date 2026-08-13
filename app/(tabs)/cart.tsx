import React from 'react';
import { View } from 'react-native';
import { Header, FeaturePlaceholder } from '@/src/components';
import { useTheme } from '@/src/providers';

export default function CartTabScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Cart" />
      <FeaturePlaceholder
        title="Cart"
        description="Cart and checkout arrive in later phases. Checkout will require sign-in."
      />
    </View>
  );
}
