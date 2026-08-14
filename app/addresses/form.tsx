import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import {
  useCreateAddressMutation,
  useGetAddressesQuery,
  useUpdateAddressMutation,
} from '@/src/store';
import { setCheckoutSelectedAddressId } from '@/src/services/checkoutSelection';
import { getErrorMessage } from '@/src/utils/errors';
import { addressBookHref } from '@/src/utils/navigation';
import { toAddressPayload } from '@/src/utils/address';
import type { AddressFormValues } from '@/src/components/business/AddressForm';
import { AddressForm, validateAddressForm } from '@/src/components/business/AddressForm';
import { ErrorState, Header } from '@/src/components';

const EMPTY_FORM: AddressFormValues = {
  addressType: 'Home',
  name: '',
  phone: '',
  house: '',
  street: '',
  area: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  lat: 0,
  lng: 0,
  isDefault: false,
};

export default function AddressFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const addressId = typeof params.id === 'string' ? params.id : undefined;
  const addressesQuery = useGetAddressesQuery();
  const existing = addressesQuery.data?.items.find((item) => item.id === addressId);

  const mappedExisting = useMemo<AddressFormValues | null>(() => {
    if (!existing) {
      return null;
    }
    return {
      addressType: existing.addressType,
      name: existing.name,
      phone: existing.phone ?? '',
      house: existing.house,
      street: existing.street,
      area: existing.area,
      landmark: existing.landmark ?? '',
      city: existing.city,
      state: existing.state,
      pincode: existing.pincode,
      lat: existing.lat,
      lng: existing.lng,
      isDefault: existing.isDefault,
    };
  }, [existing]);

  const [edited, setEdited] = useState<AddressFormValues | null>(null);
  const values = edited ?? mappedExisting ?? EMPTY_FORM;
  const [formError, setFormError] = useState<string | null>(null);
  const [createAddress, createState] = useCreateAddressMutation();
  const [updateAddress, updateState] = useUpdateAddressMutation();

  const saving = createState.isLoading || updateState.isLoading;

  const onSubmit = async () => {
    const localError = validateAddressForm(values);
    if (localError) {
      setFormError(localError);
      return;
    }
    setFormError(null);
    const body = toAddressPayload(values);
    try {
      if (addressId) {
        await updateAddress({ id: addressId, body }).unwrap();
        setCheckoutSelectedAddressId(addressId);
      } else {
        const created = await createAddress(body).unwrap();
        if (created?.id) {
          setCheckoutSelectedAddressId(created.id);
        }
      }
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace(addressBookHref());
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  if (addressId && addressesQuery.isError && !existing) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Address" showBack onBackPress={() => router.back()} />
        <ErrorState
          message={getErrorMessage(addressesQuery.error)}
          onRetry={() => {
            void addressesQuery.refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header
        title={addressId ? 'Edit address' : 'Add address'}
        showBack
        onBackPress={() => router.back()}
      />
      <View style={{ flex: 1, padding: theme.spacing.lg, paddingBottom: insets.bottom }}>
        <AddressForm
          values={values}
          loading={saving}
          errorText={formError}
          submitLabel={addressId ? 'Save address' : 'Add address'}
          onChange={(next) => {
            setEdited(next);
            setFormError(null);
          }}
          onSubmit={() => {
            void onSubmit();
          }}
        />
      </View>
    </View>
  );
}
