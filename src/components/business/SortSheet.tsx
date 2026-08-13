import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CatalogSelectionState, CatalogSortOption } from '@/src/types/catalog';
import { DEFAULT_SORT_OPTIONS } from '@/src/types/catalog';
import { BottomSheet } from '../ui/BottomSheet';
import { GButton } from '../ui/GButton';
import { GText } from '../ui/GText';
import { GIcon } from '../ui/GIcon';

export type SortSheetProps = {
  visible: boolean;
  onClose: () => void;
  selection: CatalogSelectionState;
  sortOptions?: CatalogSortOption[];
  onApply: (sort: string) => void;
};

function SortSheetBody({
  initialSort,
  sortOptions,
  onApply,
  onClose,
}: {
  initialSort: string;
  sortOptions: CatalogSortOption[];
  onApply: (sort: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState(initialSort);

  return (
    <>
      <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: theme.spacing.xs }}>
          {sortOptions.map((option) => {
            const selected = draft === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setDraft(option.id)}
                style={{
                  minHeight: theme.dimensions.touchMin,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  backgroundColor: selected
                    ? theme.colors.bg.surfaceMuted
                    : theme.colors.bg.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: theme.spacing.md,
                }}
              >
                <GText variant="bodyMd">{option.label}</GText>
                {selected ? (
                  <GIcon name="checkmark" color={theme.colors.brand.primary} size="sm" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <GButton
        title="Apply"
        onPress={() => {
          onApply(String(draft));
          onClose();
        }}
        fullWidth
      />
    </>
  );
}

export function SortSheet({
  visible,
  onClose,
  selection,
  sortOptions = DEFAULT_SORT_OPTIONS,
  onApply,
}: SortSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort by">
      {visible ? (
        <SortSheetBody
          key={`sort-${String(selection.sort)}`}
          initialSort={String(selection.sort)}
          sortOptions={sortOptions}
          onApply={onApply}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}
