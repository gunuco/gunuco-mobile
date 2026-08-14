import React from 'react';
import { View } from 'react-native';
import { GModal } from './GModal';
import { GText } from './GText';
import { GButton } from './GButton';
import { useTheme } from '@/src/providers';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <GModal visible={visible} onClose={onCancel} title={title}>
      {message ? (
        <GText variant="bodyMd" color="secondary">
          {message}
        </GText>
      ) : null}
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
        <GButton title={cancelLabel} variant="ghost" disabled={loading} onPress={onCancel} />
        <GButton
          title={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          loading={loading}
          onPress={onConfirm}
        />
      </View>
    </GModal>
  );
}
