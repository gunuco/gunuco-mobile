import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/providers';
import type {
  ProductOptionGroup,
  ProductOptionSelection,
  ProductOptionValue,
  ProductVariant,
} from '@/src/types/product';
import { isMultiSelectGroup, isOptionValueSelectable } from '@/src/utils/productDetail';
import { GChip } from '../ui/GChip';
import { GText } from '../ui/GText';

export type ProductOptionRendererProps = {
  groups: ProductOptionGroup[];
  selection: ProductOptionSelection;
  variants?: ProductVariant[];
  highlightedGroupId?: string | null;
  disabled?: boolean;
  onSelectValue: (group: ProductOptionGroup, value: ProductOptionValue) => void;
};

function layoutForGroup(group: ProductOptionGroup): 'cards' | 'chips' | 'tiles' {
  const label = group.label.toLowerCase();
  if (group.options.length <= 2) {
    return 'tiles';
  }
  if (label.includes('quantity') || label.includes('size') || label.includes('weight')) {
    return 'cards';
  }
  return 'chips';
}

function ProductOptionRendererComponent({
  groups,
  selection,
  variants,
  highlightedGroupId,
  disabled,
  onSelectValue,
}: ProductOptionRendererProps) {
  const theme = useTheme();

  if (!groups.length) {
    return null;
  }

  return (
    <View style={{ gap: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
      {groups.map((group) => {
        const selectedIds = selection[group.id] ?? [];
        const required = group.required === true;
        const highlighted = highlightedGroupId === group.id;
        const multi = isMultiSelectGroup(group);
        const layout = layoutForGroup(group);

        return (
          <View
            key={group.id}
            style={{
              gap: theme.spacing.sm,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.bg.surface,
              padding: theme.spacing.lg,
              borderWidth: highlighted ? 1 : 0,
              borderColor: highlighted ? theme.colors.semantic.danger : 'transparent',
            }}
            accessibilityRole={multi ? undefined : 'radiogroup'}
            accessibilityLabel={group.label}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: theme.spacing.sm,
              }}
            >
              <GText variant="titleSm">{group.label.toUpperCase()}</GText>
              <GText variant="caption" color={required ? 'danger' : 'secondary'}>
                {required ? 'Required' : 'Optional'}
              </GText>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.sm,
              }}
            >
              {group.options.map((value) => {
                const selected = selectedIds.includes(value.id);
                const selectable = isOptionValueSelectable(group, value, selection, variants);
                const unavailable = !selectable;
                const unavailableCopy =
                  value.unavailableLabel?.trim() ||
                  value.unavailableReason?.trim() ||
                  'Unavailable';
                const label = unavailable ? `${value.label} (${unavailableCopy})` : value.label;

                if (layout === 'chips') {
                  return (
                    <GChip
                      key={value.id}
                      label={label}
                      selected={selected}
                      disabled={disabled || unavailable}
                      accessibilityLabel={label}
                      onPress={() => onSelectValue(group, value)}
                      style={{ minHeight: theme.dimensions.touchMin }}
                    />
                  );
                }

                const tile = layout === 'tiles';
                return (
                  <Pressable
                    key={value.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: disabled || unavailable }}
                    accessibilityLabel={label}
                    disabled={disabled || unavailable}
                    onPress={() => onSelectValue(group, value)}
                    style={{
                      minHeight: theme.dimensions.touchMin,
                      minWidth: tile ? '47%' : 96,
                      flexGrow: tile ? 1 : 0,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.radius.lg,
                      borderWidth: selected ? 1.5 : 1,
                      borderColor: selected
                        ? theme.colors.brand.primary
                        : theme.colors.border.default,
                      backgroundColor: selected
                        ? theme.colors.bg.surfaceMuted
                        : theme.colors.bg.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: disabled || unavailable ? 0.5 : 1,
                    }}
                  >
                    <GText variant="label" color={selected ? 'brand' : 'primary'} align="center">
                      {label}
                    </GText>
                  </Pressable>
                );
              })}
            </View>

            {highlighted ? (
              <GText variant="caption" color="danger">
                Please select {group.label}.
              </GText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export const ProductOptionRenderer = memo(ProductOptionRendererComponent);
