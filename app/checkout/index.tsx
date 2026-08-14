import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useApplyCouponMutation,
  useApplyStoreCreditMutation,
  useCheckServiceabilityMutation,
  useCreateCheckoutMutation,
  useGetAddressesQuery,
  useGetCartQuery,
  useGetFulfilmentSlotsQuery,
  useGetPickupInfoQuery,
  useGetStoreCreditQuery,
  useRemoveCouponMutation,
  useRemoveStoreCreditMutation,
  useRevalidateCartMutation,
} from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { consumeCheckoutSelectedAddressId } from '@/src/services/checkoutSelection';
import { getErrorMessage } from '@/src/utils/errors';
import { collectCartChangeMessages, isCartCheckoutReady } from '@/src/utils/cart';
import { createIdempotencyKey } from '@/src/utils/idempotency';
import { todayDateParam } from '@/src/utils/fulfilment';
import { paymentHref, addressBookHref, addressFormHref } from '@/src/utils/navigation';
import type { FulfilmentType, ServiceabilityResult } from '@/src/types/fulfilment';
import type { ScheduleMode } from '@/src/components/business/SlotSelector';
import {
  AddressCard,
  CartChangeBanner,
  CartItem,
  CartSummary,
  CheckoutSkeleton,
  CouponInput,
  EmptyState,
  ErrorState,
  FulfilmentSelector,
  GButton,
  GCard,
  GText,
  Header,
  PickupInfoPanel,
  ServiceabilityMessage,
  Skeleton,
  SlotSelector,
  StoreCreditCard,
} from '@/src/components';
import { toAddressSummary } from '@/src/utils/address';

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const [fulfilment, setFulfilment] = useState<FulfilmentType>('DELIVERY');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('ASAP');
  const [selectedDate, setSelectedDate] = useState(todayDateParam());
  const [slotSelection, setSlotSelection] = useState<{ key: string; id: string | null }>({
    key: '',
    id: null,
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [storeCreditError, setStoreCreditError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [serviceabilityByKey, setServiceabilityByKey] = useState<{
    key: string;
    result: ServiceabilityResult | null;
  }>({ key: '', result: null });
  const idempotencyKeyRef = useRef<string | null>(null);
  const attemptFingerprintRef = useRef('');

  const cartQuery = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const addressesQuery = useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const storeCreditQuery = useGetStoreCreditQuery(undefined, { skip: !isAuthenticated });
  const pickupQuery = useGetPickupInfoQuery(undefined, {
    skip: !isAuthenticated || fulfilment !== 'PICKUP',
  });

  const cart = cartQuery.data;
  const items = cart?.items ?? [];
  const addresses = addressesQuery.data?.items ?? [];
  const explicitAddress = addressId ? addresses.find((item) => item.id === addressId) : undefined;
  const selectedAddress =
    explicitAddress ?? (addressId ? undefined : addresses.find((item) => item.isDefault === true));
  const slotKey = `${fulfilment}|${selectedDate}|${selectedAddress?.id ?? ''}`;
  const slotId = slotSelection.key === slotKey ? slotSelection.id : null;

  const slotsQuery = useGetFulfilmentSlotsQuery(
    {
      date: selectedDate,
      fulfilmentType: fulfilment,
      addressId: selectedAddress?.id,
      cartRevision: `${cart?.id ?? ''}:${items.length}:${cart?.coupon?.code ?? ''}:${cart?.storeCreditApplied ? '1' : '0'}`,
    },
    { skip: !isAuthenticated },
  );
  const [checkServiceability, serviceabilityState] = useCheckServiceabilityMutation();
  const [applyCoupon, applyCouponState] = useApplyCouponMutation();
  const [removeCoupon, removeCouponState] = useRemoveCouponMutation();
  const [applyStoreCredit, applyCreditState] = useApplyStoreCreditMutation();
  const [removeStoreCredit, removeCreditState] = useRemoveStoreCreditMutation();
  const [revalidateCart, revalidateState] = useRevalidateCartMutation();
  const [createCheckout, checkoutState] = useCreateCheckoutMutation();

  const changes = useMemo(() => collectCartChangeMessages(cart), [cart]);
  const cartReady = isCartCheckoutReady(cart);
  const slots = slotsQuery.data;
  const asapAvailable = slots?.asapAvailable === true;
  const dateOptions = slots?.availableDates?.length ? slots.availableDates : [selectedDate];
  const effectiveMode: ScheduleMode =
    slots && !asapAvailable && scheduleMode === 'ASAP' ? 'SCHEDULE' : scheduleMode;
  const serviceabilityKey =
    fulfilment === 'DELIVERY' && selectedAddress
      ? `${selectedAddress.id}:${selectedAddress.lat}:${selectedAddress.lng}`
      : '';
  const serviceability =
    serviceabilityByKey.key === serviceabilityKey ? serviceabilityByKey.result : null;

  useFocusEffect(
    useCallback(() => {
      const picked = consumeCheckoutSelectedAddressId();
      if (picked) {
        setAddressId(picked);
      }
    }, []),
  );

  useEffect(() => {
    if (!serviceabilityKey || fulfilment !== 'DELIVERY' || !selectedAddress) {
      return;
    }
    const lat = selectedAddress.lat;
    const lng = selectedAddress.lng;
    const key = serviceabilityKey;
    let cancelled = false;
    void (async () => {
      try {
        const result = await checkServiceability({ lat, lng }).unwrap();
        if (!cancelled) {
          setServiceabilityByKey({ key, result });
        }
      } catch {
        if (!cancelled) {
          setServiceabilityByKey({ key, result: null });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkServiceability, fulfilment, serviceabilityKey, selectedAddress]);

  const goSignIn = useCallback(() => {
    setAuthIntent({ returnTo: '/checkout' });
    router.push('/(auth)/phone');
  }, [router]);

  const fingerprint = `${fulfilment}|${selectedAddress?.id ?? ''}|${effectiveMode}|${slotId ?? ''}|${cart?.id ?? ''}|${items.length}|${cart?.totals.totalPaise ?? ''}|${cart?.coupon?.code ?? ''}|${cart?.storeCreditApplied ? '1' : '0'}`;

  const deliveryOk =
    fulfilment !== 'DELIVERY' || Boolean(selectedAddress && serviceability?.serviceable === true);
  const pickupOk = fulfilment !== 'PICKUP' || (!pickupQuery.isError && !pickupQuery.isLoading);
  const scheduleOk =
    (effectiveMode === 'ASAP' && asapAvailable) ||
    (effectiveMode === 'SCHEDULE' && Boolean(slotId));
  const busy =
    cartQuery.isFetching ||
    serviceabilityState.isLoading ||
    slotsQuery.isFetching ||
    pickupQuery.isFetching ||
    revalidateState.isLoading ||
    checkoutState.isLoading;
  const canContinue =
    isAuthenticated &&
    cartReady &&
    items.length > 0 &&
    deliveryOk &&
    pickupOk &&
    scheduleOk &&
    !busy;

  const onContinue = useCallback(async () => {
    if (!canContinue || !cart) {
      return;
    }
    setActionMessage(null);
    if (attemptFingerprintRef.current !== fingerprint) {
      idempotencyKeyRef.current = createIdempotencyKey();
      attemptFingerprintRef.current = fingerprint;
    }
    const idempotencyKey = idempotencyKeyRef.current ?? createIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;

    try {
      const revalidated = await revalidateCart().unwrap();
      const nextCart = revalidated ?? cartQuery.data;
      const nextChanges = collectCartChangeMessages(nextCart);
      if (!isCartCheckoutReady(nextCart) || nextChanges.length > 0) {
        setActionMessage('Your cart has been updated. Please review before continuing.');
        return;
      }
      const result = await createCheckout({
        idempotencyKey,
        fulfilment,
        asap: effectiveMode === 'ASAP' && asapAvailable,
        addressId: fulfilment === 'DELIVERY' ? selectedAddress?.id : undefined,
        slotId: effectiveMode === 'SCHEDULE' ? (slotId ?? undefined) : undefined,
        coupon: nextCart?.coupon?.code,
        storeCredit: nextCart?.storeCreditApplied ? { max: true } : undefined,
      }).unwrap();
      const paymentRef = result.checkoutId ?? result.orderDraftId ?? result.paymentIntentId;
      if (!paymentRef) {
        setActionMessage('Checkout could not be prepared. Please try again.');
        return;
      }
      router.push(paymentHref(paymentRef));
    } catch (error) {
      setActionMessage(getErrorMessage(error));
    }
  }, [
    asapAvailable,
    canContinue,
    cart,
    cartQuery.data,
    createCheckout,
    effectiveMode,
    fingerprint,
    fulfilment,
    revalidateCart,
    router,
    selectedAddress,
    slotId,
  ]);

  const couponBusy = applyCouponState.isLoading || removeCouponState.isLoading;
  const creditBusy = applyCreditState.isLoading || removeCreditState.isLoading;

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Checkout" showBack onBackPress={() => router.replace('/(tabs)/cart')} />
        <EmptyState
          title="Sign in to checkout"
          description="Checkout requires a GUNUCO account."
          actionLabel="Sign in"
          onAction={goSignIn}
        />
      </View>
    );
  }

  if (cartQuery.isLoading && !cart) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Checkout" showBack onBackPress={() => router.replace('/(tabs)/cart')} />
        <CheckoutSkeleton />
      </View>
    );
  }

  if (cartQuery.isError && items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Checkout" showBack onBackPress={() => router.replace('/(tabs)/cart')} />
        <ErrorState
          message={getErrorMessage(cartQuery.error)}
          onRetry={() => {
            void cartQuery.refetch();
          }}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Checkout" showBack onBackPress={() => router.replace('/(tabs)/cart')} />
        <EmptyState
          title="Your cart is empty"
          description="Add something delicious to your cart and it will appear here."
          actionLabel="Continue shopping"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Checkout" showBack onBackPress={() => router.replace('/(tabs)/cart')} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + 120,
          gap: theme.spacing.md,
        }}
      >
        {actionMessage ? (
          <GText variant="bodySm" color="danger">
            {actionMessage}
          </GText>
        ) : null}
        <CartChangeBanner changes={changes} />

        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="titleSm">Items</GText>
          {items.map((item) => (
            <CartItem key={item.id} item={item} compact />
          ))}
          <GButton
            title="Edit cart"
            variant="ghost"
            onPress={() => router.replace('/(tabs)/cart')}
            accessibilityLabel="Edit cart"
          />
        </GCard>

        <GCard style={{ gap: theme.spacing.sm }}>
          <GText variant="titleSm">Fulfilment</GText>
          <FulfilmentSelector value={fulfilment} onChange={setFulfilment} />
        </GCard>

        {fulfilment === 'DELIVERY' ? (
          <>
            {selectedAddress ? (
              <AddressCard address={toAddressSummary(selectedAddress)} selected />
            ) : (
              <GCard>
                <GText variant="bodySm" color="secondary">
                  Select a delivery address to continue.
                </GText>
              </GCard>
            )}
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <GButton
                title="Change"
                variant="secondary"
                onPress={() => router.push(addressBookHref({ select: true }))}
                accessibilityLabel="Change address"
              />
              <GButton
                title="Add New Address"
                variant="ghost"
                onPress={() => router.push(addressFormHref())}
                accessibilityLabel="Add new address"
              />
            </View>
            <ServiceabilityMessage
              loading={serviceabilityState.isLoading}
              result={serviceability}
              errorMessage={
                serviceabilityState.isError ? getErrorMessage(serviceabilityState.error) : null
              }
              onRetry={() => {
                if (selectedAddress) {
                  const key = `${selectedAddress.id}:${selectedAddress.lat}:${selectedAddress.lng}`;
                  void checkServiceability({
                    lat: selectedAddress.lat,
                    lng: selectedAddress.lng,
                  })
                    .unwrap()
                    .then((result) => setServiceabilityByKey({ key, result }))
                    .catch(() => setServiceabilityByKey({ key, result: null }));
                }
              }}
            />
          </>
        ) : pickupQuery.isLoading ? (
          <GCard>
            <Skeleton width="100%" height={88} />
          </GCard>
        ) : pickupQuery.isError ? (
          <ErrorState
            message={getErrorMessage(pickupQuery.error)}
            onRetry={() => {
              void pickupQuery.refetch();
            }}
          />
        ) : pickupQuery.data ? (
          <PickupInfoPanel info={pickupQuery.data} />
        ) : null}

        <SlotSelector
          mode={effectiveMode}
          onModeChange={setScheduleMode}
          asapAvailable={asapAvailable}
          dates={dateOptions}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          slots={slots?.slots ?? []}
          selectedSlotId={slotId}
          onSlotChange={(id) => setSlotSelection({ key: slotKey, id })}
          loading={slotsQuery.isFetching}
          errorMessage={slotsQuery.isError ? getErrorMessage(slotsQuery.error) : null}
          cutoffMessage={slots?.cutoffMessage}
          onRetry={() => {
            void slotsQuery.refetch();
          }}
        />

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
            const code = couponCode.trim();
            if (!code) return;
            setCouponError(null);
            void applyCoupon({ code })
              .unwrap()
              .then(() => setCouponCode(''))
              .catch((error) => setCouponError(getErrorMessage(error)));
          }}
          onRemove={() => {
            setCouponError(null);
            void removeCoupon()
              .unwrap()
              .catch((error) => setCouponError(getErrorMessage(error)));
          }}
        />

        <StoreCreditCard
          balancePaise={storeCreditQuery.data?.balancePaise ?? 0}
          applied={cart?.storeCreditApplied === true}
          appliedPaise={cart?.totals.storeCreditPaise}
          loading={creditBusy || storeCreditQuery.isFetching}
          errorText={storeCreditError}
          onApply={() => {
            setStoreCreditError(null);
            void applyStoreCredit({ max: true })
              .unwrap()
              .catch((error) => setStoreCreditError(getErrorMessage(error)));
          }}
          onRemove={() => {
            setStoreCreditError(null);
            void removeStoreCredit()
              .unwrap()
              .catch((error) => setStoreCreditError(getErrorMessage(error)));
          }}
        />

        {cart ? <CartSummary totals={cart.totals} hideDeliveryFee /> : null}
      </ScrollView>
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.default,
          backgroundColor: theme.colors.bg.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.md,
        }}
      >
        <GButton
          title="Continue to Payment"
          size="lg"
          fullWidth
          loading={revalidateState.isLoading || checkoutState.isLoading}
          disabled={!canContinue}
          onPress={() => {
            void onContinue();
          }}
          accessibilityLabel="Continue to Payment"
        />
      </View>
    </View>
  );
}
