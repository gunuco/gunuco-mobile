import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useAddWishlistItemMutation,
  useGetWishlistQuery,
  useRemoveWishlistItemMutation,
} from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { wishlistContains } from '@/src/utils/wishlist';
import { GIcon } from '../ui/GIcon';

export type WishlistButtonProps = {
  productId: string;
  initialWishlisted?: boolean;
  disabled?: boolean;
  overlay?: boolean;
  size?: 'sm' | 'md';
  onError?: (message: string) => void;
};

export function WishlistButton({
  productId,
  initialWishlisted,
  disabled,
  overlay = false,
  size = 'sm',
  onError,
}: WishlistButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [addWishlistItem, addState] = useAddWishlistItemMutation();
  const [removeWishlistItem, removeState] = useRemoveWishlistItemMutation();
  const [localError, setLocalError] = useState<string | null>(null);

  const wishlistQuery = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const wishlistedFromApi = wishlistContains(wishlistQuery.data?.items, productId);
  const wishlisted = isAuthenticated
    ? wishlistQuery.isSuccess
      ? wishlistedFromApi
      : (initialWishlisted ?? wishlistedFromApi)
    : false;

  const busy = addState.isLoading || removeState.isLoading;
  const iconSize = size === 'md' ? 'md' : 'sm';
  const label = wishlisted ? 'Remove from wishlist' : 'Add to wishlist';

  const onPress = async () => {
    if (busy || disabled || !productId) {
      return;
    }

    setLocalError(null);

    if (!isAuthenticated) {
      setAuthIntent({ pendingWishlistProductId: productId });
      router.push('/(auth)/phone');
      return;
    }

    try {
      if (wishlisted) {
        await removeWishlistItem(productId).unwrap();
      } else {
        await addWishlistItem(productId).unwrap();
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setLocalError(message);
      onError?.(message);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: wishlisted, busy, disabled: !!disabled }}
      accessibilityHint={localError ?? undefined}
      disabled={disabled || busy}
      onPress={() => {
        void onPress();
      }}
      hitSlop={8}
      style={
        overlay
          ? {
              position: 'absolute',
              top: theme.spacing.xs,
              right: theme.spacing.xs,
              backgroundColor: theme.colors.bg.surface,
              borderRadius: theme.radius.pill,
              width: theme.dimensions.touchMin,
              height: theme.dimensions.touchMin,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }
          : {
              width: theme.dimensions.touchMin,
              height: theme.dimensions.touchMin,
              alignItems: 'center',
              justifyContent: 'center',
            }
      }
    >
      {busy ? (
        <ActivityIndicator size="small" color={theme.colors.semantic.danger} />
      ) : (
        <View>
          <GIcon
            name={wishlisted ? 'heart' : 'heart-outline'}
            color={wishlisted ? theme.colors.semantic.danger : theme.colors.text.secondary}
            size={iconSize}
          />
        </View>
      )}
    </Pressable>
  );
}
