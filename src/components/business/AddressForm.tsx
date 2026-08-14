import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { AddressPayload, AddressType } from '@/src/types/address';
import { ADDRESS_TYPES } from '@/src/types/address';
import { isValidIndianMobile } from '@/src/utils/phone';
import { isValidIndianPincode } from '@/src/utils/address';
import { GInput } from '../ui/GInput';
import { GButton } from '../ui/GButton';
import { GText } from '../ui/GText';
import { GChip } from '../ui/GChip';
import { MapPicker, type MapCoordinate } from './MapPicker';

export type AddressFormValues = AddressPayload;

export type AddressFormProps = {
  values: AddressFormValues;
  loading?: boolean;
  errorText?: string | null;
  submitLabel?: string;
  onChange: (next: AddressFormValues) => void;
  onSubmit: () => void;
};

export function validateAddressForm(values: AddressFormValues): string | null {
  if (!values.name.trim()) return 'Enter the recipient name.';
  if (!isValidIndianMobile(values.phone)) return 'Enter a valid 10-digit mobile number.';
  if (!values.house.trim()) return 'Enter house or building.';
  if (!values.street.trim()) return 'Enter street.';
  if (!values.area.trim()) return 'Enter area.';
  if (!values.city.trim()) return 'Enter city.';
  if (!values.state.trim()) return 'Enter state.';
  if (!isValidIndianPincode(values.pincode)) return 'Enter a 6-digit pincode.';
  if (
    !Number.isFinite(values.lat) ||
    !Number.isFinite(values.lng) ||
    (values.lat === 0 && values.lng === 0)
  ) {
    return 'Place a pin on the map.';
  }
  return null;
}

export function AddressForm({
  values,
  loading = false,
  errorText,
  submitLabel = 'Save address',
  onChange,
  onSubmit,
}: AddressFormProps) {
  const theme = useTheme();
  const types = useMemo(() => ADDRESS_TYPES, []);

  const patch = (partial: Partial<AddressFormValues>) => {
    onChange({ ...values, ...partial });
  };

  const coordinate: MapCoordinate | null =
    Number.isFinite(values.lat) &&
    Number.isFinite(values.lng) &&
    (values.lat !== 0 || values.lng !== 0)
      ? { lat: values.lat, lng: values.lng }
      : null;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing['2xl'] }}
    >
      <GText variant="label">Address type</GText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {types.map((type) => (
          <GChip
            key={type}
            label={type}
            selected={values.addressType === type}
            onPress={() => patch({ addressType: type as AddressType })}
            accessibilityLabel={`Address type ${type}`}
          />
        ))}
      </View>
      <GInput
        label="Name"
        value={values.name}
        onChangeText={(name) => patch({ name })}
        autoCapitalize="words"
        accessibilityLabel="Recipient name"
      />
      <GInput
        label="Phone"
        value={values.phone}
        onChangeText={(phone) => patch({ phone })}
        keyboardType="phone-pad"
        accessibilityLabel="Phone"
      />
      <GInput
        label="House / building"
        value={values.house}
        onChangeText={(house) => patch({ house })}
        accessibilityLabel="House or building"
      />
      <GInput
        label="Street"
        value={values.street}
        onChangeText={(street) => patch({ street })}
        accessibilityLabel="Street"
      />
      <GInput
        label="Area"
        value={values.area}
        onChangeText={(area) => patch({ area })}
        accessibilityLabel="Area"
      />
      <GInput
        label="Landmark (optional)"
        value={values.landmark ?? ''}
        onChangeText={(landmark) => patch({ landmark })}
        accessibilityLabel="Landmark"
      />
      <GInput
        label="City"
        value={values.city}
        onChangeText={(city) => patch({ city })}
        accessibilityLabel="City"
      />
      <GInput
        label="State"
        value={values.state}
        onChangeText={(state) => patch({ state })}
        accessibilityLabel="State"
      />
      <GInput
        label="Pincode"
        value={values.pincode}
        onChangeText={(pincode) => patch({ pincode })}
        keyboardType="number-pad"
        maxLength={6}
        accessibilityLabel="Pincode"
      />
      <GChip
        label={values.isDefault ? 'Default address' : 'Set as default'}
        selected={values.isDefault === true}
        onPress={() => patch({ isDefault: !values.isDefault })}
        accessibilityLabel="Set as default address"
      />
      <MapPicker coordinate={coordinate} onChange={({ lat, lng }) => patch({ lat, lng })} />
      {errorText ? (
        <GText variant="bodySm" color="danger">
          {errorText}
        </GText>
      ) : null}
      <GButton
        title={submitLabel}
        fullWidth
        size="lg"
        loading={loading}
        onPress={onSubmit}
        accessibilityLabel={submitLabel}
      />
    </ScrollView>
  );
}
