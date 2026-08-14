import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { formatPaise } from '@/src/utils/money';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GButton } from '../ui/GButton';

export type StoreCreditCardProps = {
  balancePaise: number;
  applied?: boolean;
  appliedPaise?: number;
  loading?: boolean;
  disabled?: boolean;
  errorText?: string | null;
  onApply: () => void;
  onRemove: () => void;
};

export function StoreCreditCard({
  balancePaise,
  applied = false,
  appliedPaise,
  loading = false,
  disabled = false,
  errorText,
  onApply,
  onRemove,
}: StoreCreditCardProps) {
  const theme = useTheme();
  const canApply = !applied && balancePaise > 0 && !disabled;

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">Store Credit</GText>
      <GText variant="bodyMd" color="secondary">
        Available {formatPaise(balancePaise)}
      </GText>
      {applied ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.sm,
          }}
        >
          <GText variant="label" color="success">
            Applied
            {typeof appliedPaise === 'number' ? ` ${formatPaise(appliedPaise)}` : ''}
          </GText>
          <GButton
            title="Remove"
            variant="ghost"
            size="sm"
            loading={loading}
            onPress={onRemove}
            accessibilityLabel="Remove store credit"
          />
        </View>
      ) : (
        <GButton
          title="Use Store Credit"
          variant="secondary"
          loading={loading}
          disabled={!canApply || loading}
          onPress={onApply}
          accessibilityLabel="Use Store Credit"
        />
      )}
      {errorText ? (
        <GText variant="bodySm" color="danger">
          {errorText}
        </GText>
      ) : null}
    </GCard>
  );
}
