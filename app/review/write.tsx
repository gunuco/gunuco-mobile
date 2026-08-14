import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/providers';
import { useAuth } from '@/src/hooks';
import { useCreateReviewMutation } from '@/src/store';
import { setAuthIntent } from '@/src/services/authIntent';
import { getErrorMessage } from '@/src/utils/errors';
import { isReviewPendingModeration } from '@/src/utils/reviews';
import { GButton, GInput, GText, Header, RatingView, EmptyState } from '@/src/components';

const REVIEW_TEXT_MAX = 2000;

export default function WriteReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ orderItemId?: string; productId?: string }>();
  const orderItemId = typeof params.orderItemId === 'string' ? params.orderItemId : '';
  const productId = typeof params.productId === 'string' ? params.productId : undefined;

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createReview, createState] = useCreateReviewMutation();

  const trimmedText = text.trim();
  const canSubmit = rating >= 1 && trimmedText.length > 0 && !createState.isLoading;

  const helper = useMemo(() => {
    if (trimmedText.length === 0) {
      return 'Share what you thought about this product.';
    }
    return `${trimmedText.length} / ${REVIEW_TEXT_MAX}`;
  }, [trimmedText.length]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };

  const onSubmit = async () => {
    setLocalError(null);
    if (rating < 1) {
      setLocalError('Please choose a rating.');
      return;
    }
    if (!trimmedText) {
      setLocalError('Please write a short review.');
      return;
    }

    try {
      const result = await createReview({
        orderItemId,
        rating,
        text: trimmedText,
        productId,
      }).unwrap();
      if (isReviewPendingModeration(result.status)) {
        setSuccessMessage('Thanks. Your review will appear after it is approved.');
      } else {
        setSuccessMessage('Thanks for your review.');
      }
    } catch (error) {
      setLocalError(getErrorMessage(error));
    }
  };

  if (!orderItemId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Write a review" showBack onBackPress={goBack} />
        <EmptyState
          title="Review not available"
          description="Reviews can be written for eligible purchased items. This form opens from your order after delivery."
          actionLabel="Continue shopping"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
        <Header title="Write a review" showBack onBackPress={goBack} />
        <EmptyState
          title="Sign in to write a review"
          description="Only purchased items that the backend marks as eligible can be reviewed."
          actionLabel="Sign in with phone"
          onAction={() => {
            setAuthIntent({
              pendingWriteReview: { orderItemId, productId },
            });
            router.push('/(auth)/phone');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg.canvas }}>
      <Header title="Write a review" showBack onBackPress={goBack} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing['3xl'],
            gap: theme.spacing.lg,
          }}
        >
          <GText variant="bodyMd" color="secondary">
            Ratings and reviews are checked before they appear on the product.
          </GText>

          <View style={{ gap: theme.spacing.sm }}>
            <GText variant="label">Rating</GText>
            <RatingView mode="input" value={rating} size="md" onChange={setRating} />
          </View>

          <GInput
            label="Review"
            value={text}
            onChangeText={(next) => {
              setText(next.slice(0, REVIEW_TEXT_MAX));
              setLocalError(null);
            }}
            multiline
            textAlignVertical="top"
            placeholder="What did you like?"
            helperText={helper}
            errorText={localError ?? undefined}
            accessibilityLabel="Review text"
            style={{ minHeight: 140, paddingVertical: theme.spacing.md }}
          />

          {successMessage ? (
            <GText variant="bodyMd" color="success">
              {successMessage}
            </GText>
          ) : null}

          <GButton
            title="Submit review"
            fullWidth
            loading={createState.isLoading}
            disabled={!canSubmit || Boolean(successMessage)}
            onPress={() => {
              void onSubmit();
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
