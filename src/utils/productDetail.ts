import type {
  DisplayedProductPrice,
  ProductDetail,
  ProductHighlight,
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

function normalizeHighlights(raw: unknown): ProductHighlight[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  const highlights: ProductHighlight[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) {
      continue;
    }
    const label = asString(rec.label) ?? asString(rec.title);
    const value = asString(rec.value) ?? asString(rec.body);
    if (!label || !value) {
      continue;
    }
    highlights.push({ label, value });
  }
  return highlights.length ? highlights : undefined;
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
    pricePerKgPaise: asNumber(rec.pricePerKgPaise) ?? null,
    compareAtPricePaise: asNumber(rec.compareAtPricePaise) ?? null,
    discountLabel: asString(rec.discountLabel) ?? null,
    isDefault: asBoolean(rec.isDefault),
    iconName: asString(rec.iconName) ?? null,
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
    weightLabel: asString(payload.weightLabel) ?? null,
    badgeLabel: asString(payload.badgeLabel) ?? null,
    highlights: normalizeHighlights(payload.highlights),
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

function groupKey(group: ProductOptionGroup): string {
  return `${group.id} ${group.label}`.toLowerCase();
}

/** Weight / quantity option group (500g, 1KG, …) — not pack size for treats. */
export function isCakeQuantityGroup(group: ProductOptionGroup): boolean {
  const key = groupKey(group);
  if (/pack|box|piece|pc\b/.test(key)) {
    return false;
  }
  return /quantity|weight|size|kg|\bg\b/.test(key);
}

/** Flour / egg / sweetener / flavour ingredient groups for cake customisation. */
export function isCakeIngredientGroup(group: ProductOptionGroup): boolean {
  const key = groupKey(group);
  return /flour|egg|sweet|sugar|flavour|flavor/.test(key);
}

/**
 * CUSTOMIZE INGREDIENTS is shown only when the product schema includes cake
 * ingredient groups (flour/egg/sweetener/flavour). Cookies, brownies, and
 * other treats with pack/size options alone do not get this section.
 */
export function hasCustomizeIngredients(groups: ProductOptionGroup[]): boolean {
  return groups.filter(isCakeIngredientGroup).length >= 2;
}

export function parseQuantityKg(option: ProductOptionValue): number | null {
  const text = `${option.id} ${option.label}`.toLowerCase().replace(/,/g, '');
  const kgMatch = text.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) {
    return Number(kgMatch[1]);
  }
  const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gram)/);
  if (gramMatch) {
    return Number(gramMatch[1]) / 1000;
  }
  if (/size[-_]?500|500/.test(text)) {
    return 0.5;
  }
  if (/1[-_.]?5|1\.5/.test(text)) {
    return 1.5;
  }
  if (/2[-_.]?5|2\.5/.test(text)) {
    return 2.5;
  }
  if (/(?:^|[^\d])3(?:kg|[-_]kg)?(?:$|[^\d])/.test(text) || /size[-_]?3/.test(text)) {
    return 3;
  }
  if (/(?:^|[^\d])2(?:kg|[-_]kg)?(?:$|[^\d])/.test(text) || /size[-_]?2/.test(text)) {
    return 2;
  }
  if (/(?:^|[^\d])1(?:kg|[-_]kg)?(?:$|[^\d])/.test(text) || /size[-_]?1(?:kg)?$/.test(text)) {
    return 1;
  }
  return null;
}

export function getSelectedQuantityKg(
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): number {
  const quantityGroup = groups.find(isCakeQuantityGroup);
  if (!quantityGroup) {
    return 1;
  }
  const selectedId = selection[quantityGroup.id]?.[0];
  const option = quantityGroup.options.find((item) => item.id === selectedId);
  if (!option) {
    return 1;
  }
  return parseQuantityKg(option) ?? 1;
}

/** Customer-facing extra for an option at the selected weight (₹ scaled from /KG). */
export function getOptionExtraPaise(
  value: ProductOptionValue,
  quantityKg: number,
): number {
  if (typeof value.pricePerKgPaise === 'number') {
    return Math.round(value.pricePerKgPaise * quantityKg);
  }
  if (typeof value.pricePaise === 'number') {
    return value.pricePaise;
  }
  return 0;
}

function resolveCakeConfiguredPrice(
  product: ProductDetail,
  groups: ProductOptionGroup[],
  selection: ProductOptionSelection,
): DisplayedProductPrice | null {
  if (!hasCustomizeIngredients(groups)) {
    return null;
  }
  const quantityGroup = groups.find(isCakeQuantityGroup);
  if (!quantityGroup) {
    return null;
  }
  const selectedQtyId = selection[quantityGroup.id]?.[0];
  const qtyOption = quantityGroup.options.find((item) => item.id === selectedQtyId);
  if (!qtyOption || typeof qtyOption.pricePaise !== 'number') {
    return null;
  }

  const kg = parseQuantityKg(qtyOption) ?? 0.5;
  let pricePaise = qtyOption.pricePaise;
  let available = qtyOption.available !== false && product.isAvailable !== false;

  for (const group of groups) {
    if (group.id === quantityGroup.id) {
      continue;
    }
    const selectedIds = selection[group.id] ?? [];
    for (const valueId of selectedIds) {
      const option = group.options.find((item) => item.id === valueId);
      if (!option) {
        continue;
      }
      if (option.available === false) {
        available = false;
      }
      if (typeof option.pricePerKgPaise === 'number') {
        pricePaise += Math.round(option.pricePerKgPaise * kg);
      } else if (typeof option.pricePaise === 'number' && !isCakeQuantityGroup(group)) {
        pricePaise += option.pricePaise;
      }
    }
  }

  return {
    pricePaise,
    compareAtPricePaise: qtyOption.compareAtPricePaise ?? product.compareAtPricePaise,
    discountLabel: qtyOption.discountLabel ?? product.discountLabel,
    isAvailable: available,
  };
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

  const cakePrice = resolveCakeConfiguredPrice(product, groups, selection);
  if (cakePrice) {
    return cakePrice;
  }

  const pricedValues = collectSelectedValues(groups, selection).filter(
    (value) => typeof value.pricePaise === 'number',
  );
  if (pricedValues.length > 0) {
    const additive = pricedValues.reduce((sum, value) => sum + (value.pricePaise ?? 0), 0);
    const onlyAbsolute =
      pricedValues.length === 1 &&
      !groups.some((group) => isCakeIngredientGroup(group) || isCakeQuantityGroup(group));
    if (onlyAbsolute) {
      const pricedValue = pricedValues[0]!;
      return {
        pricePaise: pricedValue.pricePaise ?? product.pricePaise,
        compareAtPricePaise: pricedValue.compareAtPricePaise ?? product.compareAtPricePaise,
        discountLabel: pricedValue.discountLabel ?? product.discountLabel,
        isAvailable: pricedValue.available !== false && product.isAvailable !== false,
      };
    }
    return {
      pricePaise: product.pricePaise + additive,
      compareAtPricePaise: product.compareAtPricePaise,
      discountLabel: product.discountLabel,
      isAvailable: product.isAvailable !== false,
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
