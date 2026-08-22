import { useTheme } from '@/src/providers';
import type {
  ProductOptionGroup,
  ProductOptionSelection,
  ProductOptionValue,
  ProductVariant,
} from '@/src/types/product';
import { formatPaise } from '@/src/utils/money';
import {
  getOptionExtraPaise,
  getSelectedQuantityKg,
  hasCustomizeIngredients,
  isCakeIngredientGroup,
  isCakeQuantityGroup,
  isMultiSelectGroup,
  isOptionValueSelectable,
} from '@/src/utils/productDetail';
import { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { GChip } from '../ui/GChip';
import type { GIconName } from '../ui/GIcon';
import { GIcon } from '../ui/GIcon';
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

function RadioDot({ selected }: { selected: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: selected ? theme.colors.text.primary : theme.colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.xs,
      }}
    >
      {selected ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.colors.text.primary,
          }}
        />
      ) : null}
    </View>
  );
}

function IngredientOptionTile({
  group,
  value,
  selected,
  unavailable,
  label,
  extraPaise,
  disabled,
  onPress,
  compact,
}: {
  group: ProductOptionGroup;
  value: ProductOptionValue;
  selected: boolean;
  unavailable: boolean;
  label: string;
  extraPaise: number;
  disabled?: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const showIcon = Boolean(value.iconName) && !/flavour|flavor/.test(`${group.id} ${group.label}`);
  const iconName = (value.iconName as GIconName | null | undefined) ?? null;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: disabled || unavailable }}
      accessibilityLabel={extraPaise > 0 ? `${label}, plus ${formatPaise(extraPaise)}` : label}
      disabled={disabled || unavailable}
      onPress={onPress}
      style={{
        width: compact ? '18%' : undefined,
        minWidth: compact ? undefined : 72,
        flexGrow: compact ? 0 : 1,
        maxWidth: compact ? undefined : 120,
        alignItems: 'center',
        opacity: disabled || unavailable ? 0.45 : 1,
        paddingVertical: theme.spacing.xs,
      }}
    >
      {showIcon && iconName ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.xs,
          }}
        >
          <GIcon name={iconName} size={28} color={theme.colors.text.primary} />
        </View>
      ) : null}
      <GText
        variant="caption"
        color={selected ? 'primary' : 'secondary'}
        align="center"
        numberOfLines={2}
      >
        {label}
      </GText>
      {extraPaise > 0 ? (
        <GText variant="caption" color="secondary" align="center">
          +{formatPaise(extraPaise)}
        </GText>
      ) : null}
      <RadioDot selected={selected} />
    </Pressable>
  );
}

function QuantitySegmentBar({
  group,
  selection,
  variants,
  highlighted,
  disabled,
  onSelectValue,
}: {
  group: ProductOptionGroup;
  selection: ProductOptionSelection;
  variants?: ProductVariant[];
  highlighted?: boolean;
  disabled?: boolean;
  onSelectValue: (group: ProductOptionGroup, value: ProductOptionValue) => void;
}) {
  const theme = useTheme();
  const selectedIds = selection[group.id] ?? [];

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <GText variant="titleSm">QUANTITY:</GText>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: highlighted ? theme.colors.semantic.danger : theme.colors.border.default,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
        }}
        accessibilityRole="radiogroup"
        accessibilityLabel={group.label}
      >
        {group.options.map((value, index) => {
          const selected = selectedIds.includes(value.id);
          const selectable = isOptionValueSelectable(group, value, selection, variants);
          const unavailable = !selectable;
          return (
            <Pressable
              key={value.id}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: disabled || unavailable }}
              accessibilityLabel={value.label}
              disabled={disabled || unavailable}
              onPress={() => onSelectValue(group, value)}
              style={{
                flex: 1,
                minHeight: theme.dimensions.touchMin,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: 2,
                backgroundColor: selected ? theme.colors.bg.surfaceMuted : theme.colors.bg.surface,
                borderLeftWidth: index === 0 ? 0 : 1,
                borderLeftColor: theme.colors.border.default,
                opacity: disabled || unavailable ? 0.45 : 1,
              }}
            >
              <GText
                variant="caption"
                color={selected ? 'primary' : 'secondary'}
                align="center"
                numberOfLines={2}
              >
                {value.label}
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
}

function GenericOptionGroup({
  group,
  selection,
  variants,
  highlighted,
  disabled,
  onSelectValue,
}: {
  group: ProductOptionGroup;
  selection: ProductOptionSelection;
  variants?: ProductVariant[];
  highlighted?: boolean;
  disabled?: boolean;
  onSelectValue: (group: ProductOptionGroup, value: ProductOptionValue) => void;
}) {
  const theme = useTheme();
  const selectedIds = selection[group.id] ?? [];
  const required = group.required === true;
  const multi = isMultiSelectGroup(group);
  const layout = layoutForGroup(group);

  return (
    <View
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

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {group.options.map((value) => {
          const selected = selectedIds.includes(value.id);
          const selectable = isOptionValueSelectable(group, value, selection, variants);
          const unavailable = !selectable;
          const unavailableCopy =
            value.unavailableLabel?.trim() || value.unavailableReason?.trim() || 'Unavailable';
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
                borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
                backgroundColor: selected ? theme.colors.bg.surfaceMuted : theme.colors.bg.surface,
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
  const customize = hasCustomizeIngredients(groups);
  const quantityKg = getSelectedQuantityKg(groups, selection);

  const { ingredientGroups, quantityGroup, otherGroups } = useMemo(() => {
    if (!customize) {
      return {
        ingredientGroups: [] as ProductOptionGroup[],
        quantityGroup: undefined as ProductOptionGroup | undefined,
        otherGroups: groups,
      };
    }
    const ingredients: ProductOptionGroup[] = [];
    let quantity: ProductOptionGroup | undefined;
    const others: ProductOptionGroup[] = [];
    for (const group of groups) {
      if (isCakeQuantityGroup(group)) {
        quantity = group;
      } else if (isCakeIngredientGroup(group)) {
        ingredients.push(group);
      } else {
        others.push(group);
      }
    }
    const order = ['flour', 'egg', 'sweet', 'flavour', 'flavor'];
    ingredients.sort((a, b) => {
      const ai = order.findIndex((token) => groupKeyIncludes(a, token));
      const bi = order.findIndex((token) => groupKeyIncludes(b, token));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    return { ingredientGroups: ingredients, quantityGroup: quantity, otherGroups: others };
  }, [customize, groups]);

  if (!groups.length) {
    return null;
  }

  if (!customize) {
    return (
      <View style={{ gap: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
        {otherGroups.map((group) => (
          <GenericOptionGroup
            key={group.id}
            group={group}
            selection={selection}
            variants={variants}
            highlighted={highlightedGroupId === group.id}
            disabled={disabled}
            onSelectValue={onSelectValue}
          />
        ))}
      </View>
    );
  }

  const flourGroup = ingredientGroups.find((group) => groupKeyIncludes(group, 'flour'));
  const eggGroup = ingredientGroups.find((group) => groupKeyIncludes(group, 'egg'));
  const remainingIngredientGroups = ingredientGroups.filter(
    (group) => group.id !== flourGroup?.id && group.id !== eggGroup?.id,
  );

  const renderIngredientGroup = (group: ProductOptionGroup, sideBySide?: boolean) => {
    const selectedIds = selection[group.id] ?? [];
    const highlighted = highlightedGroupId === group.id;
    const isFlavour = /flavour|flavor/.test(`${group.id} ${group.label}`.toLowerCase());

    return (
      <View
        key={group.id}
        style={{
          flex: sideBySide ? 1 : undefined,
          gap: theme.spacing.sm,
          borderRadius: theme.radius.md,
          borderWidth: highlighted ? 1 : 0,
          borderColor: highlighted ? theme.colors.semantic.danger : 'transparent',
          padding: highlighted ? theme.spacing.sm : 0,
        }}
        accessibilityRole="radiogroup"
        accessibilityLabel={group.label}
      >
        <GText variant="label">{group.label.toUpperCase()}:</GText>
        {isFlavour ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: theme.spacing.md,
            }}
          >
            {group.options.map((value) => {
              const selected = selectedIds.includes(value.id);
              const selectable = isOptionValueSelectable(group, value, selection, variants);
              const unavailable = !selectable;
              const unavailableCopy =
                value.unavailableLabel?.trim() || value.unavailableReason?.trim() || 'Unavailable';
              const label = unavailable ? `${value.label} (${unavailableCopy})` : value.label;
              return (
                <IngredientOptionTile
                  key={value.id}
                  group={group}
                  value={value}
                  selected={selected}
                  unavailable={unavailable}
                  label={label}
                  extraPaise={getOptionExtraPaise(value, quantityKg)}
                  disabled={disabled}
                  compact
                  onPress={() => onSelectValue(group, value)}
                />
              );
            })}
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
            }}
          >
            {group.options.map((value) => {
              const selected = selectedIds.includes(value.id);
              const selectable = isOptionValueSelectable(group, value, selection, variants);
              const unavailable = !selectable;
              const unavailableCopy =
                value.unavailableLabel?.trim() || value.unavailableReason?.trim() || 'Unavailable';
              const label = unavailable ? `${value.label} (${unavailableCopy})` : value.label;
              return (
                <IngredientOptionTile
                  key={value.id}
                  group={group}
                  value={value}
                  selected={selected}
                  unavailable={unavailable}
                  label={label}
                  extraPaise={getOptionExtraPaise(value, quantityKg)}
                  disabled={disabled}
                  onPress={() => onSelectValue(group, value)}
                />
              );
            })}
          </View>
        )}
        {highlighted ? (
          <GText variant="caption" color="danger">
            Please select {group.label}.
          </GText>
        ) : null}
      </View>
    );
  };

  return (
    <View style={{ gap: theme.spacing.xl, paddingHorizontal: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.lg }}>
        <GText variant="titleSm">CUSTOMIZE INGREDIENTS</GText>

        {flourGroup || eggGroup ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}>
            {flourGroup ? renderIngredientGroup(flourGroup, true) : null}
            {eggGroup ? renderIngredientGroup(eggGroup, true) : null}
          </View>
        ) : null}

        {remainingIngredientGroups.map((group) => renderIngredientGroup(group))}
      </View>

      {quantityGroup ? (
        <QuantitySegmentBar
          group={quantityGroup}
          selection={selection}
          variants={variants}
          highlighted={highlightedGroupId === quantityGroup.id}
          disabled={disabled}
          onSelectValue={onSelectValue}
        />
      ) : null}

      {otherGroups.map((group) => (
        <GenericOptionGroup
          key={group.id}
          group={group}
          selection={selection}
          variants={variants}
          highlighted={highlightedGroupId === group.id}
          disabled={disabled}
          onSelectValue={onSelectValue}
        />
      ))}
    </View>
  );
}

function groupKeyIncludes(group: ProductOptionGroup, token: string): boolean {
  return `${group.id} ${group.label}`.toLowerCase().includes(token);
}

export const ProductOptionRenderer = memo(ProductOptionRendererComponent);
