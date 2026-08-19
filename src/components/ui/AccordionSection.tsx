import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GIcon } from './GIcon';
import { GText } from './GText';

export type AccordionRow = {
  label: string;
  value: string;
};

export type AccordionSectionProps = {
  title: string;
  children?: React.ReactNode;
  rows?: AccordionRow[];
  body?: string;
  defaultOpen?: boolean;
};

export function AccordionSection({
  title,
  children,
  rows,
  body,
  defaultOpen = false,
}: AccordionSectionProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = Boolean(children || body || rows?.length);

  if (!hasContent) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.bg.surfaceMuted,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        onPress={() => setOpen((current) => !current)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: theme.dimensions.touchMin - theme.spacing.md,
        }}
      >
        <GText variant="titleSm">{title}</GText>
        <GIcon
          name={open ? 'chevron-up' : 'chevron-down'}
          size="md"
          color={theme.colors.text.secondary}
        />
      </Pressable>

      {open ? (
        <View style={{ gap: theme.spacing.sm }}>
          {rows?.map((row) => (
            <View
              key={`${row.label}-${row.value}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: theme.spacing.lg,
              }}
            >
              <GText variant="bodyMd" color="secondary" style={{ flex: 1 }}>
                {row.label}
              </GText>
              <GText variant="bodyMd" style={{ flex: 1 }} align="right">
                {row.value}
              </GText>
            </View>
          ))}
          {body ? (
            <GText variant="bodyMd" color="secondary">
              {body}
            </GText>
          ) : null}
          {children}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Hide ${title}`}
            onPress={() => setOpen(false)}
            hitSlop={8}
            style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center' }}
          >
            <GText variant="label" color="brand">
              View less
            </GText>
            <GIcon name="chevron-up" size="sm" color={theme.colors.brand.primary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
