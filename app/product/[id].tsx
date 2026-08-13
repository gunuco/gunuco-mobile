import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { FeaturePlaceholder, Header } from '@/src/components';

/**
 * Product Details route shell for Phase 4 navigation.
 * Full PDP behaviour arrives in a later phase.
 */
export default function ProductDetailPlaceholderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const productId = String(params.id ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title="Product"
        showBack
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }}
      />
      <FeaturePlaceholder
        title="Product details"
        description={
          productId
            ? `Product ${productId} opens here in a later phase.`
            : 'Product details will be implemented in a later phase.'
        }
      />
    </View>
  );
}
