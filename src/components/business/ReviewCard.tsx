import React, { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { ProductReview } from '@/src/types/review';
import { formatReviewDate } from '@/src/utils/reviews';
import { GCard } from '../ui/GCard';
import { GText } from '../ui/GText';
import { RatingView } from './RatingView';

export type ReviewCardProps = {
  review: ProductReview;
};

function ReviewCardComponent({ review }: ReviewCardProps) {
  const theme = useTheme();
  const dateLabel = formatReviewDate(review.createdAt, review.createdAtLabel);
  const reviewer = review.reviewerDisplayName?.trim();

  return (
    <GCard style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        }}
      >
        <RatingView value={review.rating} size="sm" />
        {dateLabel ? (
          <GText variant="caption" color="secondary">
            {dateLabel}
          </GText>
        ) : null}
      </View>
      {reviewer ? (
        <GText variant="label" accessibilityLabel={`Review by ${reviewer}`}>
          {reviewer}
        </GText>
      ) : null}
      {review.text?.trim() ? <GText variant="bodyMd">{review.text.trim()}</GText> : null}
    </GCard>
  );
}

export const ReviewCard = memo(ReviewCardComponent);
