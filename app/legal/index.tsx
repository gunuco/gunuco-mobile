import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { LEGAL_TYPES } from '@/src/types/legal';
import { legalDocumentHref } from '@/src/utils/navigation';
import { legalTitle } from '@/src/utils/legal';
import { Header, ListRow, SettingSection } from '@/src/components';

export default function LegalHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Legal" showBack onBackPress={goBack} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing['3xl'],
        }}
      >
        <SettingSection title="Policies">
          {LEGAL_TYPES.map((type) => (
            <ListRow
              key={type}
              title={legalTitle(type)}
              onPress={() => router.push(legalDocumentHref(type))}
              accessibilityLabel={legalTitle(type)}
            />
          ))}
        </SettingSection>
      </ScrollView>
    </View>
  );
}
