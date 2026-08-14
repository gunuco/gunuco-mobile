import type {
  DisplayedProductPrice,
  ProductDetail,
  ProductImage,
  ProductInfoSection,
  ProductOfferInfo,
  ProductOptionGroup,
  ProductOptionSelection,
  ProductOptionValue,
  ProductOptionsResponse,
  ProductVariant,
} from '@/src/types/product';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function unwrapPayload(response: unknown): Record<string, unknown> | null {
  const root = asRecord(response);
  if (!root) {
    return null;
  }

  const product = asRecord(root.product);
  if (product) {
    return product;
  }

  const data = asRecord(root.data);
  if (data && !Array.isArray(root.data)) {
    const nestedProduct = asRecord(data.product);
    return nestedProduct ?? data;
  }

  return root;
}

function normalizeImages(raw: unknown, fallbackUrl?: string | null): ProductImage[] {
  const images: ProductImage[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && item.trim()) {
        images.push({ url: item });
        continue;
      }
      const rec = asRecord(item);
      if (!rec) {
        continue;
      }
      const url = asString(rec.url) ?? asString(rec.imageUrl);
      if (!url) {
        continue;
      }
      images.push({
        id: asString(rec.id),
        url,
        alt: asString(rec.alt) ?? asString(rec.altText) ?? null,
      });
    }
  }

  if (!images.length && fallbackUrl) {
    images.push({ url: fallbackUrl });
  }

  return images;
}

function normalizeOffer(raw: unknown): ProductOfferInfo | null {
  const rec = asRecord(raw);
  const title = rec ? (asString(rec.title) ?? asString(rec.label)) : undefined;
  if (!title) {
    return null;
  }
  return {
    id: rec ? asString(rec.id) : undefined,
    title,
    subtitle: rec ? (asString(rec.subtitle) ?? asString(rec.message) ?? null) : null,
  };
}

function normalizeOffers(raw: unknown): ProductOfferInfo[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const offers: ProductOfferInfo[] = [];
  for (const item of raw) {
    const offer = normalizeOffer(item);
    if (offer) {
      offers.push(offer);
    }
  }
  return offers;
}

function normalizeInfoSections(raw: unknown, attributes: unknown): ProductInfoSection[] {
  const sections: ProductInfoSection[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const rec = asRecord(item);
      if (!rec) {
        continue;
      }
      const title = asString(rec.title) ?? asString(rec.label);
      const body = asString(rec.body) ?? asString(rec.value) ?? asString(rec.text);
      if (!title || !body) {
        continue;
      }
      sections.push({
        id: asString(rec.id),
        title,
        body,
      });
    }
  }

  if (!sections.length && Array.isArray(attributes)) {
    for (const item of attributes) {
      const rec = asRecord(item);
      if (!rec) {
        continue;
      }
      const title = asString(rec.label) ?? asString(rec.title);
      const body = asString(rec.value) ?? asString(rec.body);
      if (!title || !body) {
        continue;
      }
      sections.push({
        id: asString(rec.id),
        title,
        body,
      });
    }
  }

  return sections;
}

function normalizeOptionValue(raw: unknown): ProductOptionValue | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.valueId) ?? asString(rec.value);
  const label = asString(rec.label) ?? asString(rec.name) ?? asString(rec.value);
  if (!id || !label) {
    return null;
  }

  const available = asBoolean(rec.available) ?? asBoolean(rec.isAvailable);

  return {
    id,
    label,
    available,
    unavailableLabel: asString(rec.unavailableLabel) ?? null,
    unavailableReason: asString(rec.unavailableReason) ?? asString(rec.reason) ?? null,
    pricePaise: asNumber(rec.pricePaise) ?? null,
    compareAtPricePaise: asNumber(rec.compareAtPricePaise) ?? null,
    discountLabel: asString(rec.discountLabel) ?? null,
    isDefault: asBoolean(rec.isDefault),
  };
}

function normalizeOptionGroup(raw: unknown): ProductOptionGroup | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const id = asString(rec.id) ?? asString(rec.groupId);
  const label = asString(rec.label) ?? asString(rec.name) ?? asString(rec.title);
  if (!id || !label) {
    return null;
  }

  const optionSource = Array.isArray(rec.options)
    ? rec.options
    : Array.isArray(rec.values)
      ? rec.values
      : [];
  const options: ProductOptionValue[] = [];
  for (const item of optionSource) {
    const option = normalizeOptionValue(item);
    if (option) {
      options.push(option);
    }
  }

  if (!options.length) {
    return null;
  }

  return {
    id,
    label,
    required: asBoolean(rec.required),
    type: asString(rec.type) ?? 'single',
    defaultValueId: asString(rec.defaultValueId) ?? asString(rec.defaultOptionId) ?? null,
    minSelect: asNumber(rec.minSelect),
    maxSelect: asNumber(rec.maxSelect),
    options,
  };
}

export function normalizeOptionGroups(raw: unknown): ProductOptionGroup[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const groups: ProductOptionGroup[] = [];
  for (const item of raw) {
    const group = normalizeOptionGroup(item);
    if (group) {
      groups.push(group);
    }
  }
  return groups;
}

function normalizeVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const variants: ProductVariant[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) {
      continue;
    }
    const id = asString(rec.id);
    const pricePaise = asNumber(rec.pricePaise);
    const optionValueIdsRaw = rec.optionValueIds ?? rec.valueIds ?? rec.optionIds;
    const optionValueIds = Array.isArray(optionValueIdsRaw)
      ? optionValueIdsRaw.filter((value): value is string => typeof value === 'string' && !!value)
      : [];
    if (!id || typeof pricePaise !== 'number') {
      continue;
    }
    variants.push({
      id,
      optionValueIds,
      pricePaise,
      compareAtPricePaise: asNumber(rec.compareAtPricePaise) ?? null,
      discountLabel: asString(rec.discountLabel) ?? null,
      isAvailable: asBoolean(rec.isAvailable) ?? asBoolean(rec.available),
    });
  }
  return variants;
}

export function normalizeProductDetail(response: unknown): ProductDetail {
  const payload = unwrapPayload(response) ?? {};
  const id = asString(payload.id) ?? '';
  const name = asString(payload.name) ?? '';
  const imageUrl = asString(payload.imageUrl) ?? null;
  const offer = normalizeOffer(payload.offer);
  const offers = normalizeOffers(payload.offers);
  const optionGroups = normalizeOptionGroups(
    payload.optionGroups ?? payload.options ?? payload.optionSchema,
  );

  return {
    id,
    name,
    imageUrl,
    pricePaise: asNumber(payload.pricePaise) ?? 0,
    compareAtPricePaise: asNumber(payload.compareAtPricePaise) ?? null,
    ratingAverage: asNumber(payload.ratingAverage) ?? null,
    ratingCount: asNumber(payload.ratingCount) ?? null,
    isPremium: asBoolean(payload.isPremium),
    isAvailable: asBoolean(payload.isAvailable),
    discountLabel: asString(payload.discountLabel) ?? null,
    description: asString(payload.description) ?? null,
    images: normalizeImages(payload.images, imageUrl),
    offerLabel: asString(payload.offerLabel) ?? offer?.title ?? null,
    offerMessage: asString(payload.offerMessage) ?? offer?.subtitle ?? null,
    offer,
    offers,
    availabilityStatus: asString(payload.availabilityStatus) ?? null,
    availabilityLabel: asString(payload.availabilityLabel) ?? null,
    quantityMin: asNumber(payload.quantityMin) ?? asNumber(payload.minQuantity),
    quantityMax: asNumber(payload.quantityMax) ?? asNumber(payload.maxQuantity),
    infoSections: normalizeInfoSections(payload.infoSections, payload.attributes),
    optionGroups,
    hasRequiredOptions: optionGroups.length
      ? optionGroups.some((group) => group.required === true)
      : undefined,
    category: asRecord(payload.category)
      ? {
          id: asString(asRecord(payload.category)?.id) ?? '',
          name: asString(asRecord(payload.category)?.name) ?? '',
          imageUrl: asString(asRecord(payload.category)?.imageUrl) ?? null,
        }
      : null,
    isWishlisted: asBoolean(payload.isWishlisted),
  };
}

export function normalizeProductOptions(response: unknown): ProductOptionsResponse {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data) ?? root;
  const groups = normalizeOptionGroups(
    data.groups ?? data.optionGroups ?? data.options ?? root.groups ?? root.optionGroups,
  );
  const addOnGroups = normalizeOptionGroups(data.addOns ?? root.addOns);
  const variants = normalizeVariants(data.variants ?? root.variants);

  return {
    groups: [...groups, ...addOnGroups],
    variants: variants.length ? variants : undefined,
  };
}

export function getProductImages(product: ProductDetail): ProductImage[] {
  if (product.images?.length) {
    return product.images;
  }
  if (product.imageUrl) {
    return [{ url: product.imageUrl, alt: product.name }];
  }
  return [];
}

export function getProductOffer(product: ProductDetail): ProductOfferInfo | null {
  if (product.offer?.title) {
    return product.offer;
  }
  if (product.offerLabel) {
    return {
      title: product.offerLabel,
      subtitle: product.offerMessage,
    };
  }
  const first = product.offers?.[0];
  return first?.title ? first : null;
}

export function isMultiSelectGroup(group: ProductOptionGroup): boolean {
  const type = (group.type ?? 'single').toLowerCase();
  return type === 'multi' || type === 'multi-select' || type === 'multiple';
}

export function buildDefaultSelection(groups: ProductOptionGroup[]): ProductOptionSelection {
  const selection: ProductOptionSelection = {};
  for (const group of groups) {
    const defaultId = group.defaultValueId ?? group.options.find((option) => option.isDefault)?.id;
    const defaultOption = defaultId
      ? group.options.find((option) => option.id === defaultId)
      : undefined;
    selection[group.id] =
      defaultOption && defaultOption.available !== false ? [defaultOption.id] : [];
  }
  return selection;
}

export function getMissingRequiredGroups(
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): ProductOptionGroup[] {
  return groups.filter((group) => {
    if (group.required !== true) {
      return false;
    }
    const selected = selection[group.id] ?? [];
    const minSelect = group.minSelect ?? 1;
    return selected.length < minSelect;
  });
}

function selectedValueIds(selection: ProductOptionSelection): string[] {
  return Object.values(selection).flat();
}

function variantMatchesSelection(variant: ProductVariant, selectedIds: string[]): boolean {
  if (!variant.optionValueIds.length) {
    return false;
  }
  return (
    variant.optionValueIds.every((id) => selectedIds.includes(id)) &&
    selectedIds.every((id) => variant.optionValueIds.includes(id))
  );
}

function findMatchingVariant(
  variants: ProductVariant[] | undefined,
  selection: ProductOptionSelection,
): ProductVariant | undefined {
  if (!variants?.length) {
    return undefined;
  }
  const selectedIds = selectedValueIds(selection);
  return variants.find((variant) => variantMatchesSelection(variant, selectedIds));
}

function collectSelectedValues(
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): ProductOptionValue[] {
  const values: ProductOptionValue[] = [];
  for (const group of groups) {
    const selected = selection[group.id] ?? [];
    for (const valueId of selected) {
      const option = group.options.find((item) => item.id === valueId);
      if (option) {
        values.push(option);
      }
    }
  }
  return values;
}

export function resolveDisplayedPrice(
  product: ProductDetail,
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
  variants: ProductVariant[] | undefined,
): DisplayedProductPrice {
  const matchingVariant = findMatchingVariant(variants, selection);
  if (matchingVariant) {
    return {
      pricePaise: matchingVariant.pricePaise,
      compareAtPricePaise: matchingVariant.compareAtPricePaise,
      discountLabel: matchingVariant.discountLabel ?? product.discountLabel,
      isAvailable: matchingVariant.isAvailable !== false && product.isAvailable !== false,
    };
  }

  const pricedValues = collectSelectedValues(groups, selection).filter(
    (value) => typeof value.pricePaise === 'number',
  );
  const pricedValue = pricedValues.length === 1 ? pricedValues[0] : undefined;
  if (pricedValue && typeof pricedValue.pricePaise === 'number') {
    return {
      pricePaise: pricedValue.pricePaise,
      compareAtPricePaise: pricedValue.compareAtPricePaise ?? product.compareAtPricePaise,
      discountLabel: pricedValue.discountLabel ?? product.discountLabel,
      isAvailable: pricedValue.available !== false && product.isAvailable !== false,
    };
  }

  return {
    pricePaise: product.pricePaise,
    compareAtPricePaise: product.compareAtPricePaise,
    discountLabel: product.discountLabel,
    isAvailable: product.isAvailable !== false,
  };
}

function valueAppearsInVariantMatrix(valueId: string, variants: ProductVariant[]): boolean {
  return variants.some((variant) => variant.optionValueIds.includes(valueId));
}

function isPartialSelectionPossible(selectedIds: string[], variants: ProductVariant[]): boolean {
  if (!selectedIds.length) {
    return true;
  }
  return variants.some(
    (variant) =>
      variant.isAvailable !== false &&
      selectedIds.every((id) => variant.optionValueIds.includes(id)),
  );
}

export function isOptionValueSelectable(
  group: ProductOptionGroup,
  value: ProductOptionValue,
  selection: ProductOptionSelection,
  variants: ProductVariant[] | undefined,
): boolean {
  if (value.available === false) {
    return false;
  }
  if (!variants?.length || !valueAppearsInVariantMatrix(value.id, variants)) {
    return true;
  }

  const nextSelection: ProductOptionSelection = {
    ...selection,
    [group.id]: isMultiSelectGroup(group)
      ? Array.from(new Set([...(selection[group.id] ?? []), value.id]))
      : [value.id],
  };
  return isPartialSelectionPossible(selectedValueIds(nextSelection), variants);
}

export function applyOptionValuePress(
  group: ProductOptionGroup,
  value: ProductOptionValue,
  current: ProductOptionSelection,
  groups: ProductOptionGroup[],
  variants: ProductVariant[] | undefined,
): ProductOptionSelection {
  if (!isOptionValueSelectable(group, value, current, variants)) {
    return current;
  }

  const selected = current[group.id] ?? [];
  const multi = isMultiSelectGroup(group);
  let nextForGroup: string[];

  if (multi) {
    if (selected.includes(value.id)) {
      nextForGroup = selected.filter((id) => id !== value.id);
    } else {
      const maxSelect = group.maxSelect;
      if (typeof maxSelect === 'number' && selected.length >= maxSelect) {
        return current;
      }
      nextForGroup = [...selected, value.id];
    }
  } else if (selected[0] === value.id && group.required !== true) {
    nextForGroup = [];
  } else {
    nextForGroup = [value.id];
  }

  const next: ProductOptionSelection = { ...current, [group.id]: nextForGroup };
  if (!variants?.length) {
    return next;
  }

  const reconciled: ProductOptionSelection = { ...next };
  for (const other of groups) {
    if (other.id === group.id) {
      continue;
    }
    const ids = reconciled[other.id] ?? [];
    if (!ids.length) {
      continue;
    }
    const stillValid = ids.filter((id) => {
      const option = other.options.find((item) => item.id === id);
      if (!option) {
        return false;
      }
      return isOptionValueSelectable(other, option, reconciled, variants);
    });
    if (stillValid.length !== ids.length) {
      reconciled[other.id] = stillValid;
    }
  }
  return reconciled;
}

export function toCartOptions(selection: ProductOptionSelection): {
  groupId: string;
  valueIds: string[];
}[] {
  return Object.entries(selection)
    .filter(([, valueIds]) => valueIds.length > 0)
    .map(([groupId, valueIds]) => ({ groupId, valueIds }));
}

/**
 * True when the current selection satisfies required groups and, if variants
 * exist, matches a backend variant. Used by Wishlist to decide whether a
 * cached/default configuration is safe to POST without opening Product Details.
 */
export function canSubmitProductConfiguration(
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
  variants?: ProductVariant[],
): boolean {
  if (getMissingRequiredGroups(groups, selection).length > 0) {
    return false;
  }
  if (!variants?.length) {
    return true;
  }
  return Boolean(findMatchingVariant(variants, selection));
}

export function getAvailabilityMessage(
  product: ProductDetail,
  displayedPrice: DisplayedProductPrice,
): string | null {
  const label = product.availabilityLabel?.trim();
  if (displayedPrice.isAvailable === false || product.isAvailable === false) {
    return label || 'Currently unavailable';
  }
  return label || null;
}
