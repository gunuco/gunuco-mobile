import { useCallback, useMemo, useState } from 'react';
import type {
  ProductDetail,
  ProductOptionGroup,
  ProductOptionSelection,
  ProductOptionValue,
  ProductOptionsResponse,
  ProductVariant,
} from '@/src/types/product';
import {
  applyOptionValuePress,
  buildDefaultSelection,
  getMissingRequiredGroups,
  resolveDisplayedPrice,
} from '@/src/utils/productDetail';

export type UseProductConfigurationResult = {
  groups: ProductOptionGroup[];
  variants: ProductVariant[] | undefined;
  selection: ProductOptionSelection;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  validationGroupId: string | null;
  displayedPrice: ReturnType<typeof resolveDisplayedPrice>;
  missingRequired: ProductOptionGroup[];
  selectValue: (group: ProductOptionGroup, value: ProductOptionValue) => void;
  setQuantity: (next: number) => void;
  highlightMissingRequired: () => boolean;
};

export function useProductConfiguration(
  productId: string,
  product: ProductDetail | undefined,
  options: ProductOptionsResponse | undefined,
): UseProductConfigurationResult {
  const groups = useMemo(() => {
    if (options?.groups.length) {
      return options.groups;
    }
    return product?.optionGroups ?? [];
  }, [options?.groups, product?.optionGroups]);

  const variants = options?.variants;
  const groupsKey = groups.map((group) => group.id).join('|');
  const minQuantity = product?.quantityMin ?? 1;
  const maxQuantity = product?.quantityMax ?? 99;
  const configKey = `${productId}:${groupsKey}`;

  const [selection, setSelection] = useState<ProductOptionSelection>(() =>
    buildDefaultSelection(groups),
  );
  const [selectionKey, setSelectionKey] = useState(configKey);
  const [quantity, setQuantityState] = useState(minQuantity);
  const [quantityProductId, setQuantityProductId] = useState(productId);
  const [validationGroupId, setValidationGroupId] = useState<string | null>(null);

  if (selectionKey !== configKey) {
    setSelectionKey(configKey);
    setSelection(buildDefaultSelection(groups));
    setValidationGroupId(null);
  }

  if (quantityProductId !== productId) {
    setQuantityProductId(productId);
    setQuantityState(minQuantity);
  } else if (quantity < minQuantity) {
    setQuantityState(minQuantity);
  } else if (quantity > maxQuantity) {
    setQuantityState(maxQuantity);
  }

  const displayedPrice = useMemo(
    () =>
      product
        ? resolveDisplayedPrice(product, groups, selection, variants)
        : {
            pricePaise: 0,
            compareAtPricePaise: null,
            discountLabel: null,
            isAvailable: false,
          },
    [product, groups, selection, variants],
  );

  const missingRequired = useMemo(
    () => getMissingRequiredGroups(groups, selection),
    [groups, selection],
  );

  const selectValue = useCallback(
    (group: ProductOptionGroup, value: ProductOptionValue) => {
      setSelection((current) => applyOptionValuePress(group, value, current, groups, variants));
      setValidationGroupId((current) => (current === group.id ? null : current));
    },
    [groups, variants],
  );

  const setQuantity = useCallback(
    (next: number) => {
      const clamped = Math.min(maxQuantity, Math.max(minQuantity, next));
      setQuantityState(clamped);
    },
    [maxQuantity, minQuantity],
  );

  const highlightMissingRequired = useCallback(() => {
    const first = missingRequired[0];
    if (!first) {
      setValidationGroupId(null);
      return false;
    }
    setValidationGroupId(first.id);
    return true;
  }, [missingRequired]);

  return {
    groups,
    variants,
    selection,
    quantity,
    minQuantity,
    maxQuantity,
    validationGroupId,
    displayedPrice,
    missingRequired,
    selectValue,
    setQuantity,
    highlightMissingRequired,
  };
}
