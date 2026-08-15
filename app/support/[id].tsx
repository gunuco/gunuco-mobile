import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useGetSupportTicketQuery, useSendSupportMessageMutation } from '@/src/store';
import { getErrorMessage } from '@/src/utils/errors';
import { orderHref, supportHref } from '@/src/utils/navigation';
import type { SupportMessage as SupportThreadMessage } from '@/src/types/support';
import {
  EmptyState,
  ErrorState,
  GButton,
  GText,
  Header,
  OrderListSkeleton,
  SupportComposer,
  SupportMessage,
} from '@/src/components';

export default function SupportTicketDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const ticketId = typeof params.id === 'string' ? params.id : '';
  const query = useGetSupportTicketQuery(ticketId, { skip: !ticketId || !isAuthenticated });
  const refetch = query.refetch;
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendMessage, sendState] = useSendSupportMessageMutation();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(supportHref());
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (ticketId && isAuthenticated) {
        void refetch();
      }
    }, [ticketId, isAuthenticated, refetch]),
  );

  const onSend = async () => {
    const text = draft.trim();
    if (!text || !ticketId || sendState.isLoading) {
      return;
    }
    setErrorMessage(null);
    try {
      await sendMessage({ ticketId, message: text }).unwrap();
      setDraft('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Your reply could not be sent. Please try again.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Ticket" showBack onBackPress={goBack} />
        <EmptyState title="Sign in to view this ticket" />
      </View>
    );
  }

  if (!ticketId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Ticket" showBack onBackPress={goBack} />
        <EmptyState title="Ticket not found" />
      </View>
    );
  }

  if (query.isError && !query.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Ticket" showBack onBackPress={goBack} />
        <ErrorState
          title="Unable to load this ticket"
          message={getErrorMessage(query.error, 'Unable to load this ticket.')}
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  if (query.isLoading && !query.data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Ticket" showBack onBackPress={goBack} />
        <OrderListSkeleton />
      </View>
    );
  }

  const ticket = query.data;
  if (!ticket) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Ticket" showBack onBackPress={goBack} />
        <EmptyState title="Ticket not found" />
      </View>
    );
  }

  const messages = ticket.messages;
  const showComposer = ticket.replyAllowed;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title={ticket.displayId ?? 'Ticket'} showBack onBackPress={goBack} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlashList
          data={messages}
          keyExtractor={(item: SupportThreadMessage) => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <SupportMessage message={item} />
            </View>
          )}
          ListHeaderComponent={
            <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <View
                  accessibilityRole="text"
                  accessibilityLabel={`Status ${ticket.statusLabel}`}
                  style={{
                    minHeight: theme.dimensions.chipMin,
                    paddingHorizontal: theme.spacing.md,
                    borderRadius: theme.radius.pill,
                    borderWidth: 1,
                    borderColor: theme.colors.border.default,
                    backgroundColor: theme.colors.bg.surfaceMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GText variant="caption">{ticket.statusLabel}</GText>
                </View>
                {ticket.updatedAtLabel ? (
                  <GText variant="caption" color="secondary">
                    Updated {ticket.updatedAtLabel}
                  </GText>
                ) : null}
              </View>
              {ticket.subject ? <GText variant="titleSm">{ticket.subject}</GText> : null}
              {ticket.orderId ? (
                <GButton
                  title="View Order"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push(orderHref(ticket.orderId ?? ''))}
                  accessibilityLabel="View Order"
                />
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="No messages yet"
              description="Your request is with GUNUCO support."
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={query.isFetching && messages.length > 0}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.brand.primary}
              colors={[theme.colors.brand.primary]}
            />
          }
          contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
        />
        {showComposer ? (
          <View
            style={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border.default,
              backgroundColor: theme.colors.bg.canvas,
              gap: theme.spacing.sm,
            }}
          >
            {errorMessage ? (
              <GText variant="bodySm" color="danger">
                {errorMessage}
              </GText>
            ) : null}
            <SupportComposer
              value={draft}
              onChange={setDraft}
              onSend={() => {
                void onSend();
              }}
              sending={sendState.isLoading}
            />
          </View>
        ) : (
          <View
            style={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.md,
            }}
          >
            <GText variant="caption" color="secondary">
              This ticket is closed. Replies are not available.
            </GText>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
