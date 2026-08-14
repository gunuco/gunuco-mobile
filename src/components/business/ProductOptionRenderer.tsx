import React, { memo } from 'react';
import { View } from 'react-native';
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
    <View style={{ gap: theme.spacing.lg, paddingHorizontal: theme.spacing.lg }}>
      {groups.map((group) => {
        const selectedIds = selection[group.id] ?? [];
        const required = group.required === true;
        const highlighted = highlightedGroupId === group.id;
        const multi = isMultiSelectGroup(group);

        return (
          <View
            key={group.id}
            style={{
              gap: theme.spacing.sm,
              borderRadius: theme.radius.lg,
              borderWidth: highlighted ? 1 : 0,
              borderColor: highlighted ? theme.colors.semantic.danger : 'transparent',
              padding: highlighted ? theme.spacing.sm : 0,
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
              <GText variant="label">{group.label}</GText>
              <GText variant="caption" color={required ? 'danger' : 'secondary'}>
                {required ? 'Required' : 'Optional'}
              </GText>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {group.options.map((value) => {
                const selected = selectedIds.includes(value.id);
                const selectable = isOptionValueSelectable(group, value, selection, variants);
                const unavailable = !selectable;
                const unavailableCopy =
                  value.unavailableLabel?.trim() ||
                  value.unavailableReason?.trim() ||
                  'Unavailable';
                const label = unavailable ? `${value.label} (${unavailableCopy})` : value.label;

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
