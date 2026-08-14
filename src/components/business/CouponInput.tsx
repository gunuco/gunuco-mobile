import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GInput } from '../ui/GInput';
import { GButton } from '../ui/GButton';
import { GText } from '../ui/GText';
import { GCard } from '../ui/GCard';

export type CouponInputProps = {
  value: string;
  appliedCode?: string | null;
  appliedLabel?: string | null;
  loading?: boolean;
  errorText?: string | null;
  disabled?: boolean;
  onChangeValue: (next: string) => void;
  onApply: () => void;
  onRemove?: () => void;
};

export function CouponInput({
  value,
  appliedCode,
  appliedLabel,
  loading = false,
  errorText,
  disabled = false,
  onChangeValue,
  onApply,
  onRemove,
}: CouponInputProps) {
  const theme = useTheme();
  const applied = Boolean(appliedCode);

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">Coupon</GText>
      {applied ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <GText variant="label">{appliedCode}</GText>
            {appliedLabel ? (
              <GText variant="caption" color="secondary">
                {appliedLabel}
              </GText>
            ) : (
              <GText variant="caption" color="success">
                Applied
              </GText>
            )}
          </View>
          {onRemove ? (
            <GButton
              title="Remove"
              variant="ghost"
              size="sm"
              loading={loading}
              disabled={disabled}
              onPress={onRemove}
              accessibilityLabel={`Remove coupon ${appliedCode}`}
            />
          ) : null}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
          <GInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Enter coupon code"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!disabled && !loading}
            errorText={errorText ?? undefined}
            accessibilityLabel="Coupon code"
            containerStyle={{ flex: 1 }}
          />
          <GButton
            title="Apply"
            size="md"
            loading={loading}
            disabled={disabled || loading || value.trim().length === 0}
            onPress={onApply}
            accessibilityLabel="Apply coupon"
            style={{ marginTop: 0 }}
          />
        </View>
      )}
    </GCard>
  );
}
