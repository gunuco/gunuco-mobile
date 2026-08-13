import type { CategoryNode } from '@/src/types/catalog';

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

/** Flatten active leaf-friendly nodes for search subcategory chips. */
export function flattenSubcategories(categories: CategoryNode[] | undefined): CategoryNode[] {
  if (!categories?.length) {
    return [];
  }

  const result: CategoryNode[] = [];

  for (const main of categories) {
    if (main.isActive === false) {
      continue;
    }
    const children = (main.children ?? []).filter((child) => child.isActive !== false);
    if (children.length > 0) {
      result.push(...children);
    }
  }

  return result;
}
