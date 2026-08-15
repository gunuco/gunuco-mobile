import React from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import { GText } from '../ui/GText';

export type LegalDocumentViewProps = {
  title: string;
  content: string;
};

export function LegalDocumentView({ title, content }: LegalDocumentViewProps) {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
      }}
    >
      <GText variant="titleMd">{title}</GText>
      <View>
        <GText variant="bodyMd">{content}</GText>
      </View>
    </ScrollView>
  );
}
