import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type {
  CatalogFilterGroup,
  CatalogSelectionState,
  CatalogSortOption,
  CategoryNode,
} from '@/src/types/catalog';
import { DEFAULT_SORT_OPTIONS } from '@/src/types/catalog';
import { formatPaise } from '@/src/utils/money';
import { GChip } from '../ui/GChip';
import { GText } from '../ui/GText';

export type CatalogToolbarProps = {
  selection: CatalogSelectionState;
  resultCount?: number;
  sortOptions?: CatalogSortOption[];
  filterGroups?: CatalogFilterGroup[];
  subcategories?: CategoryNode[];
  onOpenSort: () => void;
  onOpenFilter: () => void;
  onClearFilters: () => void;
  onClearSubcategory?: () => void;
  onClearFilterKey?: (key: string) => void;
  onClearPrice?: () => void;
};

export function CatalogToolbar({
  selection,
  resultCount,
  sortOptions = DEFAULT_SORT_OPTIONS,
  filterGroups = [],
  subcategories = [],
  onOpenSort,
  onOpenFilter,
  onClearFilters,
  onClearSubcategory,
  onClearFilterKey,
  onClearPrice,
}: CatalogToolbarProps) {
  const theme = useTheme();

  const sortLabel = sortOptions.find((option) => option.id === selection.sort)?.label ?? 'Sort';

  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onClear?: () => void }[] = [];

    if (selection.subcategory) {
      const sub = subcategories.find((item) => item.id === selection.subcategory);
      chips.push({
        id: 'subcategory',
        label: sub?.name ?? 'Subcategory',
        onClear: onClearSubcategory,
      });
    }

    if (selection.priceMin != null || selection.priceMax != null) {
      const min = selection.priceMin != null ? formatPaise(selection.priceMin) : 'Any';
      const max = selection.priceMax != null ? formatPaise(selection.priceMax) : 'Any';
      chips.push({
        id: 'price',
        label: `${min} – ${max}`,
        onClear: onClearPrice,
      });
    }

    for (const [key, value] of Object.entries(selection.filters)) {
      const group = filterGroups.find((item) => item.id === key);
      const option = group?.options?.find((item) => item.value === value);
      chips.push({
        id: key,
        label: option?.label ?? value,
        onClear: onClearFilterKey ? () => onClearFilterKey(key) : undefined,
      });
    }

    return chips;
  }, [selection, subcategories, filterGroups, onClearSubcategory, onClearPrice, onClearFilterKey]);

  const hasFilters = activeChips.length > 0;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <GText variant="caption" color="secondary" style={{ flex: 1 }} numberOfLines={1}>
          {typeof resultCount === 'number' ? `${resultCount} products` : ' '}
        </GText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <GChip label={sortLabel} iconName="swap-vertical-outline" onPress={onOpenSort} />
          <GChip
            label="Filter"
            iconName="options-outline"
            selected={hasFilters}
            onPress={onOpenFilter}
          />
        </View>
      </View>

      {hasFilters ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
            alignItems: 'center',
          }}
        >
          {activeChips.map((chip) => (
            <GChip key={chip.id} label={chip.label} selected onClear={chip.onClear} />
          ))}
          <GChip label="Clear all" onPress={onClearFilters} />
        </ScrollView>
      ) : null}
    </View>
  );
}
