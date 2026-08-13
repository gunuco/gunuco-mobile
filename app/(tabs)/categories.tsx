import React from 'react';
import { View } from 'react-native';
import { Header, FeaturePlaceholder } from '@/src/components';
import { useTheme } from '@/src/providers';

export default function CategoriesTabScreen() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Categories" />
      <FeaturePlaceholder
        title="Categories"
        description="Category browsing will be implemented in a later phase."
      />
    </View>
  );
}
