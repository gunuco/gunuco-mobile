import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/src/providers';

export type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const theme = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = useMemo(() => {
    const chars = value.replace(/\D/g, '').slice(0, length).split('');
    return Array.from({ length }, (_, index) => chars[index] ?? '');
  }, [value, length]);

  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (autoFocus) {
      inputs.current[0]?.focus();
    }
  }, [autoFocus]);

  const updateAt = (index: number, char: string) => {
    const next = [...digits];
    next[index] = char;
    onChange(next.join(''));
  };

  const handleChange = (index: number, text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) {
      updateAt(index, '');
      return;
    }

    if (cleaned.length > 1) {
      const merged = (value.replace(/\D/g, '') + cleaned).slice(0, length);
      onChange(merged);
      const focusIndex = Math.min(merged.length, length - 1);
      inputs.current[focusIndex]?.focus();
      setFocusedIndex(focusIndex);
      return;
    }

    updateAt(index, cleaned);
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (index: number, event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      updateAt(index - 1, '');
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
      }}
    >
      {digits.map((digit, index) => (
        <Pressable
          key={`otp-${index}`}
          onPress={() => inputs.current[index]?.focus()}
          accessibilityRole="button"
          accessibilityLabel={`OTP digit ${index + 1}`}
        >
          <TextInput
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={(event) => handleKeyPress(index, event)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={length}
            editable={!disabled}
            selectTextOnFocus
            style={{
              width: 44,
              height: theme.dimensions.inputHeight,
              borderRadius: theme.radius.lg,
              borderWidth: 1.5,
              borderColor: error
                ? theme.colors.semantic.danger
                : focusedIndex === index
                  ? theme.colors.border.focus
                  : theme.colors.border.default,
              backgroundColor: theme.colors.bg.surface,
              textAlign: 'center',
              color: theme.colors.text.primary,
              ...theme.typography.titleSm,
              opacity: disabled ? 0.5 : 1,
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}
