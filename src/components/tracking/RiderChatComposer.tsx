import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GInput } from '../ui/GInput';
import { GButton } from '../ui/GButton';

export type RiderChatComposerProps = {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
};

export function RiderChatComposer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
}: RiderChatComposerProps) {
  const theme = useTheme();
  const canSend = value.trim().length > 0 && !sending && !disabled;

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
      <View style={{ flex: 1 }}>
        <GInput
          value={value}
          onChangeText={onChange}
          placeholder="Message your rider"
          editable={!disabled}
          accessibilityLabel="Rider chat message"
        />
      </View>
      <GButton
        title="Send"
        disabled={!canSend}
        loading={sending}
        onPress={onSend}
        accessibilityLabel="Send"
      />
    </View>
  );
}
