import type { CategoryNode } from '@/src/types/catalog';

/**
 * Customer-visible category rule:
 * - If `isActive` is present, require `true`.
 * - If omitted, trust GET /categories (and Home) as active-only payloads.
 * Never filter by category name.
 */
export function isCustomerVisibleCategory(category: Pick<CategoryNode, 'isActive'>): boolean {
  if (typeof category.isActive === 'boolean') {
    return category.isActive === true;
  }
  return true;
}

/** Depth-first find in a category tree (main → sub → …). */
export function findCategoryById(
  categories: CategoryNode[] | undefined,
  id: string,
): CategoryNode | undefined {
  if (!categories?.length) {
    return undefined;
  }

  for (const node of categories) {
    if (node.id === id) {
      return node;
    }
    const nested = findCategoryById(node.children, id);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

/** Flatten customer-visible children for search subcategory chips. */
export function flattenSubcategories(categories: CategoryNode[] | undefined): CategoryNode[] {
  if (!categories?.length) {
    return [];
  }

  const result: CategoryNode[] = [];

  for (const main of categories) {
    if (!isCustomerVisibleCategory(main)) {
      continue;
    }
    const children = (main.children ?? []).filter(isCustomerVisibleCategory);
    if (children.length > 0) {
      result.push(...children);
    }
  }

  return result;
}
