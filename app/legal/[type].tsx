import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useGetLegalDocumentQuery } from '@/src/store';
import { isLegalType, legalTitle } from '@/src/utils/legal';
import { isHttpsUrl } from '@/src/utils/urls';
import { getErrorMessage } from '@/src/utils/errors';
import { legalHref } from '@/src/utils/navigation';
import {
  EmptyState,
  ErrorState,
  GButton,
  GText,
  Header,
  LegalDocumentView,
  OrderListSkeleton,
} from '@/src/components';

function readableLegalText(value: string): string {
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return value;
  }
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function LegalDocumentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();
  const typeParam = typeof params.type === 'string' ? params.type : undefined;
  const type = isLegalType(typeParam) ? typeParam : undefined;
  const query = useGetLegalDocumentQuery(type ?? 'terms', { skip: !type });

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(legalHref());
  };

  const content = useMemo(() => {
    const raw = query.data?.content;
    return raw ? readableLegalText(raw) : undefined;
  }, [query.data?.content]);

  const openUrl = async () => {
    const url = query.data?.url;
    if (!url || !isHttpsUrl(url)) {
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  };

  if (!type) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Legal" showBack onBackPress={goBack} />
        <EmptyState title="Document not found" />
      </View>
    );
  }

  const title = query.data?.title ?? legalTitle(type);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title={title} showBack onBackPress={goBack} />
      {query.isError && !query.data ? (
        <ErrorState
          title="Unable to load this document"
          message={getErrorMessage(query.error, 'Unable to load this document.')}
          onRetry={() => void query.refetch()}
        />
      ) : query.isLoading && !query.data ? (
        <OrderListSkeleton count={6} />
      ) : !query.data || (!content && !query.data.url) ? (
        <EmptyState
          title="Unable to load this document"
          description="Please try again."
          actionLabel="Retry"
          onAction={() => void query.refetch()}
        />
      ) : content ? (
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
          <LegalDocumentView title={title} content={content} />
          {query.data.url && isHttpsUrl(query.data.url) ? (
            <View style={{ padding: theme.spacing.lg }}>
              <GButton
                title="Open original document"
                variant="secondary"
                onPress={() => {
                  void openUrl();
                }}
                accessibilityLabel="Open original document"
              />
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
          <GText variant="bodyMd" color="secondary">
            This policy is hosted securely in your browser. GUNUCO does not send your account
            details to that page.
          </GText>
          <GButton
            title="View document"
            onPress={() => {
              void openUrl();
            }}
            accessibilityLabel="View document"
          />
        </View>
      )}
    </View>
  );
}
