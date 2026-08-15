import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useGetRiderChatMessagesQuery, useSendRiderChatMessageMutation } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { ordersHref } from '@/src/utils/navigation';
import {
  EmptyState,
  ErrorState,
  GText,
  Header,
  RiderChatComposer,
  RiderChatMessage,
} from '@/src/components';

const CHAT_POLL_MS = 10000;

export default function RiderChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(false);
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === 'string' ? params.id : '';
  const [draft, setDraft] = useState('');
  const [page, setPage] = useState(1);
  const [sendError, setSendError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const threadQuery = useGetRiderChatMessagesQuery(
    { orderId, page },
    {
      skip: !orderId || !focused,
      pollingInterval: focused ? CHAT_POLL_MS : 0,
      refetchOnFocus: true,
    },
  );
  const [sendMessage, sendState] = useSendRiderChatMessageMutation();
  const items = threadQuery.data?.items ?? [];

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(ordersHref());
  }, [router]);

  const onSend = async () => {
    const text = draft.trim();
    if (!orderId || !text || sendState.isLoading) {
      return;
    }
    setSendError(null);
    try {
      await sendMessage({ orderId, text }).unwrap();
      setDraft('');
    } catch (error) {
      setSendError(getErrorMessage(error));
    }
  };

  if (!orderId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Rider chat" showBack onBackPress={goBack} />
        <EmptyState title="Order not found" />
      </View>
    );
  }

  if (threadQuery.isError && items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Rider chat" showBack onBackPress={goBack} />
        <ErrorState
          message={getErrorMessage(threadQuery.error)}
          onRetry={() => void threadQuery.refetch()}
        />
      </View>
    );
  }

  if (threadQuery.data?.available === false) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Rider chat" showBack onBackPress={goBack} />
        <EmptyState
          title="Chat is not available"
          description={
            threadQuery.data.message ?? 'Chat with the rider is not available right now.'
          }
          actionLabel="Back"
          onAction={goBack}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Rider chat" showBack onBackPress={goBack} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xs }}
            >
              <RiderChatMessage message={item} />
            </View>
          )}
          onStartReached={() => {
            if (threadQuery.data?.hasMore && !threadQuery.isFetching) {
              setPage((current) => current + 1);
            }
          }}
          onStartReachedThreshold={0.2}
          contentContainerStyle={{
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.md,
          }}
        />
        {sendError ? (
          <GText variant="caption" color="danger" style={{ paddingHorizontal: theme.spacing.lg }}>
            {sendError}
          </GText>
        ) : null}
        <View
          style={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border.default,
            backgroundColor: theme.colors.bg.surface,
          }}
        >
          <RiderChatComposer
            value={draft}
            onChange={setDraft}
            sending={sendState.isLoading}
            onSend={() => {
              void onSend();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
