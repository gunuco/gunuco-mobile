import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GInput } from '../ui/GInput';
import { GButton } from '../ui/GButton';

export type SupportComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
};

export function SupportComposer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
}: SupportComposerProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !sending && !disabled;

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <GInput
          value={value}
          onChangeText={onChange}
          placeholder="Write a reply"
          editable={!disabled}
          multiline
          accessibilityLabel="Support reply"
        />
      </View>
      <GButton
        title="Send"
        disabled={!canSend}
        loading={sending}
        onPress={onSend}
        accessibilityLabel="Send reply"
      />
    </View>
  );
}
