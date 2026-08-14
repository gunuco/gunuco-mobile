import type {
  Cart,
  CartChange,
  CartCoupon,
  CartLine,
  CartSelectedOption,
  CartTotals,
} from '@/src/types/cart';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function unwrapCart(response: unknown): Record<string, unknown> {
  const root = asRecord(response) ?? {};
  const data = asRecord(root.data);
  return asRecord(root.cart) ?? asRecord(data?.cart) ?? data ?? root;
}

function normalizeSelectedOption(raw: unknown): CartSelectedOption | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }

  const valueLabelsRaw = rec.valueLabels ?? rec.labels ?? rec.valueLabel;
  const valueIdsRaw = rec.valueIds ?? rec.optionValueIds;
  const singleValueLabel = asString(valueLabelsRaw);
  const singleValueId = asString(valueIdsRaw);
  const valueLabels = Array.isArray(valueLabelsRaw)
    ? valueLabelsRaw.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
    : singleValueLabel
      ? [singleValueLabel]
      : undefined;
  const valueIds = Array.isArray(valueIdsRaw)
    ? valueIdsRaw.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      )
    : singleValueId
      ? [singleValueId]
      : undefined;

  return {
    groupId: asString(rec.groupId),
    groupLabel: asString(rec.groupLabel) ?? asString(rec.label) ?? asString(rec.name),
    valueIds,
    valueLabels,
    summary: asString(rec.summary) ?? asString(rec.display) ?? asString(rec.text),
  };
}

function normalizeChange(raw: unknown): CartChange | null {
  if (typeof raw === 'string' && raw.trim()) {
    return { message: raw.trim() };
  }
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const message =
    asString(rec.message) ??
    asString(rec.text) ??
    asString(rec.description) ??
    asString(rec.reason);
  const type = asString(rec.type) ?? asString(rec.code);
  if (!message && !type && asNumber(rec.previousPricePaise) === undefined) {
    return null;
  }
  return {
    type,
    message,
    productName: asString(rec.productName) ?? asString(rec.name),
    previousPricePaise: asNumber(rec.previousPricePaise) ?? asNumber(rec.oldPricePaise),
    currentPricePaise:
      asNumber(rec.currentPricePaise) ?? asNumber(rec.newPricePaise) ?? asNumber(rec.pricePaise),
  };
}

function normalizeCartLine(raw: unknown): CartLine | null {
  const rec = asRecord(raw);
  if (!rec) {
    return null;
  }
  const product = asRecord(rec.product);
  const id = asString(rec.id) ?? asString(rec.cartItemId) ?? asString(rec.lineId);
  const productId = asString(rec.productId) ?? asString(product?.id);
  const name = asString(rec.name) ?? asString(product?.name);
  if (!id || !productId || !name) {
    return null;
  }

  const selectedRaw = rec.selectedOptions ?? rec.options ?? rec.optionSelections;
  const selectedOptions = Array.isArray(selectedRaw)
    ? selectedRaw
        .map(normalizeSelectedOption)
        .filter((item): item is CartSelectedOption => item !== null)
    : undefined;

  const changesRaw = rec.changes ?? rec.notices;
  const changes = Array.isArray(changesRaw)
    ? changesRaw.map(normalizeChange).filter((item): item is CartChange => item !== null)
    : undefined;

  return {
    id,
    productId,
    name,
    imageUrl: asString(rec.imageUrl) ?? asString(product?.imageUrl) ?? null,
    quantity: asNumber(rec.quantity) ?? 1,
    quantityMin: asNumber(rec.quantityMin) ?? asNumber(rec.minQuantity),
    quantityMax: asNumber(rec.quantityMax) ?? asNumber(rec.maxQuantity),
    unitPricePaise:
      asNumber(rec.unitPricePaise) ?? asNumber(rec.pricePaise) ?? asNumber(rec.unitPrice) ?? 0,
    lineTotalPaise:
      asNumber(rec.lineTotalPaise) ?? asNumber(rec.lineTotal) ?? asNumber(rec.totalPaise),
    compareAtPricePaise:
      asNumber(rec.compareAtPricePaise) ?? asNumber(product?.compareAtPricePaise) ?? null,
    previousPricePaise: asNumber(rec.previousPricePaise) ?? asNumber(rec.oldPricePaise),
    optionsSummary:
      asString(rec.optionsSummary) ??
      asString(rec.optionSummary) ??
      asString(rec.selectedOptionsLabel),
    selectedOptions,
    isAvailable: asBoolean(rec.isAvailable) ?? asBoolean(product?.isAvailable),
    availabilityLabel:
      asString(rec.availabilityLabel) ??
      asString(rec.unavailableLabel) ??
      asString(rec.unavailableReason),
    priceChanged: asBoolean(rec.priceChanged),
    optionsChanged: asBoolean(rec.optionsChanged) ?? asBoolean(rec.optionsInvalid),
    quantityChanged: asBoolean(rec.quantityChanged),
    changes,
  };
}

function normalizeTotals(
  raw: Record<string, unknown>,
  nested?: Record<string, unknown> | null,
): CartTotals {
  const source = nested ?? raw;
  return {
    subtotalPaise: asNumber(source.subtotalPaise) ?? asNumber(source.subtotal),
    discountPaise: asNumber(source.discountPaise) ?? asNumber(source.discount),
    taxPaise: asNumber(source.taxPaise) ?? asNumber(source.tax),
    deliveryFeePaise:
      asNumber(source.deliveryFeePaise) ??
      asNumber(source.deliveryFee) ??
      asNumber(source.deliveryPaise),
    totalPaise:
      asNumber(source.totalPaise) ??
      asNumber(source.total) ??
      asNumber(source.payablePaise) ??
      asNumber(source.grandTotalPaise) ??
      asNumber(source.grandTotal),
  };
}

function normalizeCoupon(raw: Record<string, unknown>): CartCoupon | null {
  const nested = asRecord(raw.coupon) ?? asRecord(raw.appliedCoupon);
  const code =
    asString(nested?.code) ?? asString(raw.couponCode) ?? asString(raw.appliedCouponCode);
  if (!code) {
    return null;
  }
  return {
    code,
    label: asString(nested?.label) ?? asString(nested?.title) ?? asString(raw.couponLabel),
  };
}

function normalizeChanges(raw: Record<string, unknown>): CartChange[] | undefined {
  const list = raw.changes ?? raw.cartChanges ?? raw.notices;
  if (!Array.isArray(list)) {
    return undefined;
  }
  const changes = list.map(normalizeChange).filter((item): item is CartChange => item !== null);
  return changes.length ? changes : undefined;
}

export function normalizeCart(response: unknown): Cart {
  const payload = unwrapCart(response);
  const rawItems = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.lines)
      ? payload.lines
      : Array.isArray(payload.cartItems)
        ? payload.cartItems
        : [];

  const items: CartLine[] = [];
  const seen = new Set<string>();
  for (const raw of rawItems) {
    const item = normalizeCartLine(raw);
    if (!item || seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    items.push(item);
  }

  return {
    id: asString(payload.id) ?? asString(payload.cartId),
    items,
    totals: normalizeTotals(payload, asRecord(payload.totals)),
    coupon: normalizeCoupon(payload),
    itemCount: asNumber(payload.itemCount) ?? asNumber(payload.lineCount),
    totalQuantity: asNumber(payload.totalQuantity) ?? asNumber(payload.quantity),
    isValid: asBoolean(payload.isValid),
    canCheckout: asBoolean(payload.canCheckout),
    checkoutBlocked: asBoolean(payload.checkoutBlocked),
    checkoutBlockedReason:
      asString(payload.checkoutBlockedReason) ??
      asString(payload.blockedReason) ??
      asString(payload.message),
    changes: normalizeChanges(payload),
    message: asString(payload.message) ?? asString(payload.statusMessage),
  };
}

export function isNormalizedCart(value: unknown): value is Cart {
  return Boolean(asRecord(value) && Array.isArray((value as Cart).items));
}

/** True when a mutation body is a cart payload rather than `{ itemId }` / empty ack. */
export function mutationReturnedCart(response: unknown): Cart | undefined {
  const root = asRecord(response);
  if (!root) {
    return undefined;
  }
  const data = asRecord(root.data);
  const hasCartShape = Boolean(
    asRecord(root.cart) ||
    asRecord(data?.cart) ||
    Array.isArray(root.items) ||
    Array.isArray(root.lines) ||
    Array.isArray(data?.items) ||
    asRecord(root.totals) ||
    asRecord(data?.totals),
  );
  if (!hasCartShape) {
    return undefined;
  }
  return normalizeCart(response);
}

export function getCartBadgeCount(cart: Cart | undefined): number {
  if (!cart) {
    return 0;
  }
  if (typeof cart.itemCount === 'number') {
    return cart.itemCount;
  }
  if (typeof cart.totalQuantity === 'number') {
    return cart.totalQuantity;
  }
  return cart.items.length;
}

export function formatCartOptionSummary(item: CartLine): string | undefined {
  const summary = item.optionsSummary?.trim();
  if (summary) {
    return summary;
  }
  if (!item.selectedOptions?.length) {
    return undefined;
  }

  const parts: string[] = [];
  for (const option of item.selectedOptions) {
    if (option.summary?.trim()) {
      parts.push(option.summary.trim());
      continue;
    }
    const values = option.valueLabels?.filter((label) => label.trim().length > 0).join(', ');
    if (option.groupLabel && values) {
      parts.push(`${option.groupLabel}: ${values}`);
    } else if (values) {
      parts.push(values);
    }
  }
  return parts.length ? parts.join('\n') : undefined;
}

export function isCartCheckoutReady(cart: Cart | undefined): boolean {
  if (!cart || cart.items.length === 0) {
    return false;
  }
  if (typeof cart.canCheckout === 'boolean') {
    return cart.canCheckout;
  }
  if (cart.checkoutBlocked === true || cart.isValid === false) {
    return false;
  }
  const hasUnavailable = cart.items.some((item) => item.isAvailable === false);
  const hasInvalidOptions = cart.items.some((item) => item.optionsChanged === true);
  if (hasUnavailable || hasInvalidOptions) {
    return false;
  }
  if (cart.isValid === true) {
    return true;
  }
  return !cart.items.some((item) => item.priceChanged === true);
}

export function collectCartChangeMessages(cart: Cart | undefined): CartChange[] {
  if (!cart) {
    return [];
  }
  if (cart.changes?.length) {
    return cart.changes;
  }

  const messages: CartChange[] = [];
  for (const item of cart.items) {
    if (item.changes?.length) {
      messages.push(...item.changes);
      continue;
    }
    if (item.priceChanged && item.previousPricePaise != null) {
      messages.push({
        type: 'price',
        productName: item.name,
        previousPricePaise: item.previousPricePaise,
        currentPricePaise: item.unitPricePaise,
      });
    }
    if (item.isAvailable === false) {
      messages.push({
        type: 'availability',
        productName: item.name,
        message: item.availabilityLabel ?? `${item.name} is currently unavailable.`,
      });
    }
    if (item.optionsChanged) {
      messages.push({
        type: 'options',
        productName: item.name,
        message: `Selected options for ${item.name} are no longer valid. Please choose a new configuration.`,
      });
    }
    if (item.quantityChanged) {
      messages.push({
        type: 'quantity',
        productName: item.name,
        message: `Quantity for ${item.name} was updated.`,
      });
    }
  }
  return messages;
}
