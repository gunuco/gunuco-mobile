import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CatalogFilterGroup, CatalogSelectionState, CategoryNode } from '@/src/types/catalog';
import { BottomSheet } from '../ui/BottomSheet';
import { GButton } from '../ui/GButton';
import { GChip } from '../ui/GChip';
import { GText } from '../ui/GText';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';

export type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selection: CatalogSelectionState;
  filterGroups?: CatalogFilterGroup[];
  subcategories?: CategoryNode[];
  showSubcategoryFilter?: boolean;
  resultCount?: number;
  initialPane?: string;
  onApply: (next: CatalogSelectionState) => void;
  onClear: () => void;
};

type FilterPane = {
  id: string;
  label: string;
};

function FilterSheetBody({
  selection,
  filterGroups,
  subcategories,
  showSubcategoryFilter,
  resultCount,
  initialPane,
  onApply,
  onClear,
  onClose,
}: {
  selection: CatalogSelectionState;
  filterGroups: CatalogFilterGroup[];
  subcategories: CategoryNode[];
  showSubcategoryFilter: boolean;
  resultCount?: number;
  initialPane?: string;
  onApply: (next: CatalogSelectionState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState<CatalogSelectionState>({
    ...selection,
    filters: { ...selection.filters },
  });

  const priceGroup = useMemo(
    () => filterGroups.find((group) => group.type === 'range' || group.id === 'price'),
    [filterGroups],
  );
  const optionGroups = useMemo(
    () => filterGroups.filter((group) => group.type !== 'range' && group.id !== 'price'),
    [filterGroups],
  );

  const minBound = priceGroup?.minPaise ?? 0;
  const maxBound = Math.max(priceGroup?.maxPaise ?? 100000, minBound + 100);
  const lowPaise = draft.priceMin ?? minBound;
  const highPaise = draft.priceMax ?? maxBound;

  const panes = useMemo<FilterPane[]>(() => {
    const next: FilterPane[] = [];
    if (showSubcategoryFilter && subcategories.length > 0) {
      next.push({ id: 'subcategory', label: 'Category' });
    }
    next.push({ id: 'price', label: priceGroup?.label ?? 'Price' });
    for (const group of optionGroups) {
      next.push({ id: group.id, label: group.label });
    }
    return next;
  }, [optionGroups, priceGroup?.label, showSubcategoryFilter, subcategories.length]);

  const fallbackPane = panes[0]?.id ?? 'price';
  const [activePane, setActivePane] = useState(
    panes.some((pane) => pane.id === initialPane) ? initialPane : fallbackPane,
  );
  const pane = panes.some((item) => item.id === activePane) ? activePane : fallbackPane;
  const activeGroup = optionGroups.find((group) => group.id === pane);

  const applyLabel =
    typeof resultCount === 'number' ? `Show ${resultCount} products` : 'Show products';

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          minHeight: 360,
          maxHeight: 460,
          marginHorizontal: -theme.spacing.lg,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.border.default,
        }}
      >
        <ScrollView
          style={{
            width: 132,
            backgroundColor: theme.colors.bg.surfaceMuted,
          }}
          showsVerticalScrollIndicator={false}
        >
          {panes.map((item) => {
            const selected = item.id === pane;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActivePane(item.id)}
                style={{
                  minHeight: theme.dimensions.touchMin,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.md,
                  justifyContent: 'center',
                  backgroundColor: selected ? theme.colors.bg.surface : 'transparent',
                  borderLeftWidth: 3,
                  borderLeftColor: selected ? theme.colors.brand.primary : 'transparent',
                }}
              >
                <GText variant="label" color={selected ? 'primary' : 'secondary'}>
                  {item.label}
                </GText>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          style={{ flex: 1, backgroundColor: theme.colors.bg.surface }}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          {pane === 'subcategory' ? (
            <>
              <GText variant="label">Select category</GText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {subcategories.map((sub) => (
                  <GChip
                    key={sub.id}
                    label={sub.name}
                    selected={draft.subcategory === sub.id}
                    onPress={() =>
                      setDraft((prev) => ({
                        ...prev,
                        subcategory: prev.subcategory === sub.id ? undefined : sub.id,
                      }))
                    }
                  />
                ))}
              </View>
            </>
          ) : null}

          {pane === 'price' ? (
            <>
              <GText variant="label">Select price range</GText>
              <PriceRangeSlider
                minPaise={minBound}
                maxPaise={maxBound}
                lowPaise={lowPaise}
                highPaise={highPaise}
                onChange={(nextLow, nextHigh) =>
                  setDraft((prev) => ({
                    ...prev,
                    priceMin: nextLow,
                    priceMax: nextHigh,
                  }))
                }
              />
            </>
          ) : null}

          {activeGroup ? (
            <>
              <GText variant="label">{`Select ${activeGroup.label.toLowerCase()}`}</GText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {(activeGroup.options ?? []).map((option) => {
                  const selected = draft.filters[activeGroup.id] === option.value;
                  return (
                    <GChip
                      key={option.id}
                      label={option.label}
                      selected={selected}
                      onPress={() =>
                        setDraft((prev) => {
                          const filters = { ...prev.filters };
                          if (selected) {
                            delete filters[activeGroup.id];
                          } else {
                            filters[activeGroup.id] = option.value;
                          }
                          return { ...prev, filters };
                        })
                      }
                    />
                  );
                })}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <GButton
            title="Clear All"
            variant="tertiary"
            onPress={() => {
              setDraft({
                sort: draft.sort,
                filters: {},
              });
              onClear();
            }}
            fullWidth
            style={{
              borderColor: theme.colors.brand.primary,
              borderWidth: 1,
            }}
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <GButton
            title={applyLabel}
            onPress={() => {
              const nextMin =
                draft.priceMin != null && draft.priceMin > minBound ? draft.priceMin : undefined;
              const nextMax =
                draft.priceMax != null && draft.priceMax < maxBound ? draft.priceMax : undefined;
              onApply({
                ...draft,
                priceMin: nextMin,
                priceMax: nextMax,
              });
              onClose();
            }}
            fullWidth
          />
        </View>
      </View>
    </>
  );
}

export function FilterSheet({
  visible,
  onClose,
  selection,
  filterGroups = [],
  subcategories = [],
  showSubcategoryFilter = false,
  resultCount,
  initialPane,
  onApply,
  onClear,
}: FilterSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      contentStyle={{ maxHeight: '90%' }}
    >
      {visible ? (
        <FilterSheetBody
          key={`filter-${initialPane ?? 'default'}-${selection.sort}-${selection.subcategory ?? ''}-${selection.priceMin ?? ''}-${selection.priceMax ?? ''}-${JSON.stringify(selection.filters)}`}
          selection={selection}
          filterGroups={filterGroups}
          subcategories={subcategories}
          showSubcategoryFilter={showSubcategoryFilter}
          resultCount={resultCount}
          initialPane={initialPane}
          onApply={onApply}
          onClear={onClear}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}
