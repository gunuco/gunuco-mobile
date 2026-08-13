import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type { CatalogFilterGroup, CatalogSelectionState, CategoryNode } from '@/src/types/catalog';
import { formatPaise } from '@/src/utils/money';
import { BottomSheet } from '../ui/BottomSheet';
import { GButton } from '../ui/GButton';
import { GChip } from '../ui/GChip';
import { GInput } from '../ui/GInput';
import { GText } from '../ui/GText';

export type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  selection: CatalogSelectionState;
  filterGroups?: CatalogFilterGroup[];
  subcategories?: CategoryNode[];
  showSubcategoryFilter?: boolean;
  onApply: (next: CatalogSelectionState) => void;
  onClear: () => void;
};

function parsePaiseInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const rupees = Number(trimmed);
  if (!Number.isFinite(rupees) || rupees < 0) {
    return undefined;
  }
  return Math.round(rupees * 100);
}

function FilterSheetBody({
  selection,
  filterGroups,
  subcategories,
  showSubcategoryFilter,
  onApply,
  onClear,
  onClose,
}: {
  selection: CatalogSelectionState;
  filterGroups: CatalogFilterGroup[];
  subcategories: CategoryNode[];
  showSubcategoryFilter: boolean;
  onApply: (next: CatalogSelectionState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState<CatalogSelectionState>({
    ...selection,
    filters: { ...selection.filters },
  });
  const [priceMinText, setPriceMinText] = useState(
    typeof selection.priceMin === 'number' ? String(selection.priceMin / 100) : '',
  );
  const [priceMaxText, setPriceMaxText] = useState(
    typeof selection.priceMax === 'number' ? String(selection.priceMax / 100) : '',
  );

  const priceGroup = useMemo(
    () => filterGroups.find((group) => group.type === 'range' || group.id === 'price'),
    [filterGroups],
  );

  const optionGroups = useMemo(
    () => filterGroups.filter((group) => group.type !== 'range' && group.id !== 'price'),
    [filterGroups],
  );

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
        <View style={{ gap: theme.spacing.xl }}>
          {showSubcategoryFilter && subcategories.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              <GText variant="label">Subcategory</GText>
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
            </View>
          ) : null}

          <View style={{ gap: theme.spacing.sm }}>
            <GText variant="label">Price (₹)</GText>
            {priceGroup?.minPaise != null || priceGroup?.maxPaise != null ? (
              <GText variant="caption" color="secondary">
                Available range{' '}
                {priceGroup.minPaise != null ? formatPaise(priceGroup.minPaise) : '—'} –{' '}
                {priceGroup.maxPaise != null ? formatPaise(priceGroup.maxPaise) : '—'}
              </GText>
            ) : null}
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <GInput
                  label="Min"
                  value={priceMinText}
                  onChangeText={setPriceMinText}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={{ flex: 1 }}>
                <GInput
                  label="Max"
                  value={priceMaxText}
                  onChangeText={setPriceMaxText}
                  keyboardType="numeric"
                  placeholder="Any"
                />
              </View>
            </View>
          </View>

          {optionGroups.map((group) => (
            <View key={group.id} style={{ gap: theme.spacing.sm }}>
              <GText variant="label">{group.label}</GText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {(group.options ?? []).map((option) => {
                  const selected = draft.filters[group.id] === option.value;
                  return (
                    <GChip
                      key={option.id}
                      label={option.label}
                      selected={selected}
                      onPress={() =>
                        setDraft((prev) => {
                          const filters = { ...prev.filters };
                          if (selected) {
                            delete filters[group.id];
                          } else {
                            filters[group.id] = option.value;
                          }
                          return { ...prev, filters };
                        })
                      }
                    />
                  );
                })}
              </View>
            </View>
          ))}

          {optionGroups.length === 0 && !showSubcategoryFilter ? (
            <GText variant="bodySm" color="secondary">
              More product option filters appear when the catalogue provides them.
            </GText>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <GButton
            title="Clear"
            variant="secondary"
            onPress={() => {
              onClear();
              onClose();
            }}
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <GButton
            title="Apply"
            onPress={() => {
              onApply({
                ...draft,
                priceMin: parsePaiseInput(priceMinText),
                priceMax: parsePaiseInput(priceMaxText),
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
  onApply,
  onClear,
}: FilterSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      contentStyle={{ maxHeight: '85%' }}
    >
      {visible ? (
        <FilterSheetBody
          key={`filter-${selection.sort}-${selection.subcategory ?? ''}-${selection.priceMin ?? ''}-${selection.priceMax ?? ''}-${JSON.stringify(selection.filters)}`}
          selection={selection}
          filterGroups={filterGroups}
          subcategories={subcategories}
          showSubcategoryFilter={showSubcategoryFilter}
          onApply={onApply}
          onClear={onClear}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}
