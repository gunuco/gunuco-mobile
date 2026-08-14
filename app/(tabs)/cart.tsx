import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useApplyCouponMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useRemoveCouponMutation,
  useUpdateCartItemMutation,
} from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { productHref } from '@/src/utils/navigation';
import { collectCartChangeMessages, isCartCheckoutReady } from '@/src/utils/cart';
import type { CartLine } from '@/src/types/cart';
import {
  CartChangeBanner,
  CartItem,
  CartSkeleton,
  CartSummary,
  ConfirmDialog,
  CouponInput,
  EmptyState,
  ErrorState,
  GButton,
  GText,
  Header,
} from '@/src/components';

export default function CartTabScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    tone: 'success' | 'danger';
    text: string;
  } | null>(null);
  const [mutatingItemId, setMutatingItemId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<CartLine | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem, updateState] = useUpdateCartItemMutation();
  const [removeCartItem, removeState] = useRemoveCartItemMutation();
  const [applyCoupon, applyState] = useApplyCouponMutation();
  const [removeCoupon, removeCouponState] = useRemoveCouponMutation();

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const changes = useMemo(() => collectCartChangeMessages(cart), [cart]);
  const checkoutReady = isCartCheckoutReady(cart);
  const couponBusy = applyState.isLoading || removeCouponState.isLoading;

  const onSignIn = useCallback(() => {
    setAuthIntent({ returnTo: '/(tabs)/cart' });
    router.push('/(auth)/phone');
  }, [router]);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    setRefreshing(true);
    try {
      await cartQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [cartQuery, isAuthenticated]);

  const openProduct = useCallback(
    (productId: string) => {
      router.push(productHref(productId));
    },
    [router],
  );

  const onQuantityChange = useCallback(
    async (item: CartLine, quantity: number) => {
      if (mutatingItemId || quantity === item.quantity || item.isAvailable === false) {
        return;
      }
      setActionMessage(null);
      setMutatingItemId(item.id);
      try {
        await updateCartItem({ itemId: item.id, quantity }).unwrap();
      } catch (error) {
        setActionMessage({ tone: 'danger', text: getErrorMessage(error) });
      } finally {
        setMutatingItemId(null);
      }
    },
    [mutatingItemId, updateCartItem],
  );

  const confirmRemove = useCallback(async () => {
    if (!pendingRemove) {
      return;
    }
    const item = pendingRemove;
    setActionMessage(null);
    setMutatingItemId(item.id);
    try {
      await removeCartItem(item.id).unwrap();
      setPendingRemove(null);
    } catch (error) {
      setActionMessage({ tone: 'danger', text: getErrorMessage(error) });
    } finally {
      setMutatingItemId(null);
    }
  }, [pendingRemove, removeCartItem]);

  const onApplyCoupon = useCallback(async () => {
    const code = couponCode.trim();
    if (!code || couponBusy) {
      return;
    }
    setCouponError(null);
    setActionMessage(null);
    try {
      await applyCoupon({ code }).unwrap();
      setCouponCode('');
    } catch (error) {
      setCouponError(getErrorMessage(error));
    }
  }, [applyCoupon, couponBusy, couponCode]);

  const onRemoveCoupon = useCallback(async () => {
    if (couponBusy) {
      return;
    }
    setCouponError(null);
    setActionMessage(null);
    try {
      await removeCoupon().unwrap();
    } catch (error) {
      setCouponError(getErrorMessage(error));
    }
  }, [couponBusy, removeCoupon]);

  const onCheckout = useCallback(() => {
    if (!checkoutReady) {
      return;
    }
    setCheckoutNotice('Checkout will be available in a later update.');
  }, [checkoutReady]);

  const renderItem = useCallback(
    ({ item }: { item: CartLine }) => (
      <View style={{ paddingBottom: theme.spacing.md }}>
        <CartItem
          item={item}
          quantityLoading={mutatingItemId === item.id && updateState.isLoading}
          removeDisabled={mutatingItemId === item.id}
          onPress={() => openProduct(item.productId)}
          onQuantityChange={(quantity) => {
            void onQuantityChange(item, quantity);
          }}
          onRemove={() => setPendingRemove(item)}
          onEditOptions={() => openProduct(item.productId)}
        />
      </View>
    ),
    [mutatingItemId, onQuantityChange, openProduct, theme.spacing.md, updateState.isLoading],
  );

  const continueShopping = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Cart" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!isAuthenticated ? (
          <EmptyState
            title="Sign in to view your cart"
            description="Your cart is saved to your GUNUCO account so it is ready on every device."
            iconName="cart-outline"
            actionLabel="Sign in"
            onAction={onSignIn}
          />
        ) : cartQuery.isLoading && !cartQuery.data ? (
          <CartSkeleton />
        ) : cartQuery.isError && items.length === 0 ? (
          <ErrorState
            message={getErrorMessage(cartQuery.error)}
            onRetry={() => {
              void cartQuery.refetch();
            }}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add something delicious to your cart and it will appear here."
            iconName="cart-outline"
            actionLabel="Continue shopping"
            onAction={continueShopping}
          />
        ) : (
          <>
            <FlashList
              data={items}
              extraData={`${mutatingItemId ?? ''}:${updateState.isLoading ? '1' : '0'}`}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.md,
              }}
              ListHeaderComponent={
                <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                  {actionMessage ? (
                    <GText
                      variant="bodySm"
                      color={actionMessage.tone === 'success' ? 'success' : 'danger'}
                    >
                      {actionMessage.text}
                    </GText>
                  ) : null}
                  {cart?.message ? (
                    <GText variant="bodySm" color="secondary">
                      {cart.message}
                    </GText>
                  ) : null}
                  <CartChangeBanner changes={changes} />
                </View>
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    void onRefresh();
                  }}
                  tintColor={theme.colors.brand.primary}
                  colors={[theme.colors.brand.primary]}
                />
              }
            />
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.border.default,
                backgroundColor: theme.colors.bg.surface,
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.md,
                paddingBottom: insets.bottom + theme.spacing.md,
                gap: theme.spacing.sm,
              }}
            >
              <CouponInput
                value={couponCode}
                appliedCode={cart?.coupon?.code}
                appliedLabel={cart?.coupon?.label}
                loading={couponBusy}
                errorText={couponError}
                onChangeValue={(next) => {
                  setCouponCode(next);
                  setCouponError(null);
                }}
                onApply={() => {
                  void onApplyCoupon();
                }}
                onRemove={() => {
                  void onRemoveCoupon();
                }}
              />
              {cart ? <CartSummary totals={cart.totals} /> : null}
              {cart?.checkoutBlockedReason && !checkoutReady ? (
                <GText variant="bodySm" color="danger">
                  {cart.checkoutBlockedReason}
                </GText>
              ) : null}
              {checkoutNotice ? (
                <GText variant="bodySm" color="secondary">
                  {checkoutNotice}
                </GText>
              ) : null}
              <GButton
                title="Proceed to Checkout"
                size="lg"
                fullWidth
                disabled={!checkoutReady || updateState.isLoading || removeState.isLoading}
                onPress={onCheckout}
                accessibilityLabel="Proceed to Checkout"
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
      <ConfirmDialog
        visible={Boolean(pendingRemove)}
        title="Remove item?"
        message={pendingRemove ? `Remove ${pendingRemove.name} from cart?` : undefined}
        confirmLabel="Remove"
        cancelLabel="Keep"
        destructive
        loading={Boolean(pendingRemove && mutatingItemId === pendingRemove.id)}
        onCancel={() => {
          if (!removeState.isLoading) {
            setPendingRemove(null);
          }
        }}
        onConfirm={() => {
          void confirmRemove();
        }}
      />
    </View>
  );
}
