import React from 'react';
import { useTheme } from '@/src/providers';
import type { ServiceabilityResult } from '@/src/types/fulfilment';
import { formatPaise } from '@/src/utils/money';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { GLoader } from '../ui/GLoader';
import { GButton } from '../ui/GButton';

export type ServiceabilityMessageProps = {
  loading?: boolean;
  result?: ServiceabilityResult | null;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function ServiceabilityMessage({
  loading,
  result,
  errorMessage,
  onRetry,
}: ServiceabilityMessageProps) {
  const theme = useTheme();

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">Delivery availability</GText>
      {loading ? (
        <GLoader />
      ) : errorMessage ? (
        <>
          <GText variant="bodySm" color="danger">
            {errorMessage}
          </GText>
          {onRetry ? (
            <GButton title="Retry" variant="secondary" size="sm" onPress={onRetry} />
          ) : null}
        </>
      ) : result?.serviceable ? (
        <>
          <GText variant="bodyMd" color="success">
            {result.message ?? 'Delivery is available to this location.'}
          </GText>
          {typeof result.feePaise === 'number' ? (
            <GText variant="label">Delivery fee {formatPaise(result.feePaise)}</GText>
          ) : null}
        </>
      ) : result ? (
        <GText variant="bodyMd" color="danger">
          {result.message ?? 'Delivery is not available to this location.'}
        </GText>
      ) : (
        <GText variant="bodySm" color="secondary">
          Select an address to check delivery.
        </GText>
      )}
    </GCard>
  );
}
