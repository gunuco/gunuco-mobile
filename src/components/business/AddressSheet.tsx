import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetAddressesQuery } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { addressFormHref } from '@/src/utils/navigation';
import { toAddressSummary } from '@/src/utils/address';
import { getErrorMessage } from '@/src/utils/errors';
import type { Address } from '@/src/types/address';
import { BottomSheet } from '../ui/BottomSheet';
import { ErrorState } from '../ui/ErrorState';
import { GIcon } from '../ui/GIcon';
import { GText } from '../ui/GText';
import { Skeleton } from '../ui/Skeleton';
import { AddressCard } from './AddressCard';

export type AddressSheetProps = {
  visible: boolean;
  selectedId?: string | null;
  onClose: () => void;
  onSelect: (address: Address) => void;
  onAddNew?: () => void;
};

export function AddressSheet({
  visible,
  selectedId,
  onClose,
  onSelect,
  onAddNew,
}: AddressSheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const addressesQuery = useGetAddressesQuery(undefined, { skip: !isAuthenticated || !visible });
  const items = addressesQuery.data?.items ?? [];

  const addNew = () => {
    onClose();
    if (onAddNew) {
      onAddNew();
      return;
    }
    if (!isAuthenticated) {
      setAuthIntent({ returnTo: '/addresses/form' });
      router.push('/(auth)/phone');
      return;
    }
    router.push(addressFormHref());
  };

  const sorted = useMemo(() => {
    return [...items].sort((left, right) => Number(right.isDefault) - Number(left.isDefault));
  }, [items]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Select Address" showClose>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add new address"
        onPress={addNew}
        style={{
          minHeight: theme.dimensions.touchMin,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          paddingHorizontal: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}
      >
        <GIcon name="add" color={theme.colors.brand.primary} />
        <GText variant="label" color="brand" style={{ flex: 1 }}>
          Add New Address
        </GText>
        <GIcon name="chevron-forward" color={theme.colors.text.secondary} />
      </Pressable>

      <GText variant="titleSm">Saved Addresses</GText>

      {!isAuthenticated ? (
        <GText variant="bodyMd" color="secondary">
          Sign in to choose a delivery address.
        </GText>
      ) : addressesQuery.isLoading && items.length === 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Skeleton height={72} />
          <Skeleton height={72} />
        </View>
      ) : addressesQuery.isError && items.length === 0 ? (
        <ErrorState
          message={getErrorMessage(addressesQuery.error)}
          onRetry={() => {
            void addressesQuery.refetch();
          }}
        />
      ) : (
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              borderRadius: theme.radius.xl,
              overflow: 'hidden',
              backgroundColor: theme.colors.bg.surface,
              borderWidth: 1,
              borderColor: theme.colors.border.default,
            }}
          >
            {sorted.map((address, index) => (
              <View key={address.id}>
                {index > 0 ? (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.border.default,
                      marginLeft: theme.spacing['3xl'],
                    }}
                  />
                ) : null}
                <AddressCard
                  address={toAddressSummary(address)}
                  variant="select"
                  selected={selectedId === address.id}
                  onPress={() => onSelect(address)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </BottomSheet>
  );
}
