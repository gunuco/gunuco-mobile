import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import {
  clearCheckoutSelectedAddressId,
  peekCheckoutSelectedAddressId,
  setCheckoutSelectedAddressId,
} from '@/src/services/checkoutSelection';
import { getErrorMessage } from '@/src/utils/errors';
import { addressFormHref, checkoutHref } from '@/src/utils/navigation';
import { toAddressPayload, toAddressSummary } from '@/src/utils/address';
import type { Address } from '@/src/types/address';
import {
  AddressCard,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  GButton,
  GText,
  Header,
  Skeleton,
} from '@/src/components';

export default function AddressBookScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ select?: string }>();
  const selectMode = params.select === '1';
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const addressesQuery = useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const [deleteAddress, deleteState] = useDeleteAddressMutation();
  const [updateAddress, updateState] = useUpdateAddressMutation();
  const items = addressesQuery.data?.items ?? [];

  const onSelect = useCallback(
    (address: Address) => {
      if (!selectMode) {
        return;
      }
      setCheckoutSelectedAddressId(address.id);
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(checkoutHref());
    },
    [router, selectMode],
  );

  const onSetDefault = useCallback(
    async (address: Address) => {
      setActionError(null);
      try {
        await updateAddress({
          id: address.id,
          body: { ...toAddressPayload(address), isDefault: true },
        }).unwrap();
      } catch (error) {
        setActionError(getErrorMessage(error));
      }
    },
    [updateAddress],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }
    setActionError(null);
    try {
      const deletedId = pendingDelete.id;
      await deleteAddress(deletedId).unwrap();
      if (peekCheckoutSelectedAddressId() === deletedId) {
        clearCheckoutSelectedAddressId();
      }
      setPendingDelete(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }, [deleteAddress, pendingDelete]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Addresses" showBack onBackPress={() => router.back()} />
        <EmptyState
          title="Sign in to manage addresses"
          actionLabel="Sign in"
          onAction={() => {
            setAuthIntent({ returnTo: '/addresses' });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={selectMode ? 'Select address' : 'Addresses'}
        showBack
        onBackPress={() => router.back()}
      />
      {addressesQuery.isLoading && items.length === 0 ? (
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <Skeleton width="100%" height={96} />
          <Skeleton width="100%" height={96} />
        </View>
      ) : addressesQuery.isError && items.length === 0 ? (
        <ErrorState
          message={getErrorMessage(addressesQuery.error)}
          onRetry={() => {
            void addressesQuery.refetch();
          }}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add an address for delivery."
          actionLabel="Add address"
          onAction={() => router.push(addressFormHref())}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing['3xl'],
            gap: theme.spacing.md,
          }}
        >
          {actionError ? (
            <GText variant="bodySm" color="danger">
              {actionError}
            </GText>
          ) : null}
          {items.map((address) => (
            <AddressCard
              key={address.id}
              address={toAddressSummary(address)}
              onPress={selectMode ? () => onSelect(address) : undefined}
              onEditPress={() => router.push(addressFormHref(address.id))}
              onDeletePress={() => setPendingDelete(address)}
              onSetDefaultPress={
                address.isDefault
                  ? undefined
                  : () => {
                      void onSetDefault(address);
                    }
              }
            />
          ))}
          <GButton
            title="Add New Address"
            fullWidth
            loading={updateState.isLoading}
            onPress={() => router.push(addressFormHref())}
            accessibilityLabel="Add new address"
          />
        </ScrollView>
      )}
      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="Delete address?"
        message={pendingDelete ? `Remove ${pendingDelete.name} from your address book?` : undefined}
        confirmLabel="Delete"
        destructive
        loading={deleteState.isLoading}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </View>
  );
}
