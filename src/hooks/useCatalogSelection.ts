import { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_PRODUCT_SORT,
  type CatalogSelectionState,
  type ProductSort,
} from '@/src/types/catalog';

export type UseCatalogSelectionResult = {
  selection: CatalogSelectionState;
  page: number;
  setPage: (page: number) => void;
  setSort: (sort: ProductSort | string) => void;
  setPriceRange: (priceMin?: number, priceMax?: number) => void;
  setSubcategory: (subcategory?: string) => void;
  setFilterValue: (filterId: string, value?: string) => void;
  applySelection: (next: CatalogSelectionState) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  resetPage: () => void;
};

const INITIAL: CatalogSelectionState = {
  sort: DEFAULT_PRODUCT_SORT,
  filters: {},
};

export function useCatalogSelection(
  initial?: Partial<CatalogSelectionState>,
): UseCatalogSelectionResult {
  const [selection, setSelection] = useState<CatalogSelectionState>({
    ...INITIAL,
    ...initial,
    filters: { ...INITIAL.filters, ...initial?.filters },
  });
  const [page, setPage] = useState(1);

  const resetPage = useCallback(() => setPage(1), []);

  const setSort = useCallback((sort: ProductSort | string) => {
    setSelection((prev) => ({ ...prev, sort }));
    setPage(1);
  }, []);

  const setPriceRange = useCallback((priceMin?: number, priceMax?: number) => {
    setSelection((prev) => ({ ...prev, priceMin, priceMax }));
    setPage(1);
  }, []);

  const setSubcategory = useCallback((subcategory?: string) => {
    setSelection((prev) => ({ ...prev, subcategory }));
    setPage(1);
  }, []);

  const setFilterValue = useCallback((filterId: string, value?: string) => {
    setSelection((prev) => {
      const filters = { ...prev.filters };
      if (!value) {
        delete filters[filterId];
      } else {
        filters[filterId] = value;
      }
      return { ...prev, filters };
    });
    setPage(1);
  }, []);

  const applySelection = useCallback((next: CatalogSelectionState) => {
    setSelection({
      ...next,
      filters: { ...next.filters },
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelection((prev) => ({
      sort: prev.sort,
      filters: {},
      priceMin: undefined,
      priceMax: undefined,
      subcategory: undefined,
    }));
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      selection.priceMin != null ||
      selection.priceMax != null ||
      selection.subcategory ||
      Object.keys(selection.filters).length > 0,
    );
  }, [selection]);

  return {
    selection,
    page,
    setPage,
    setSort,
    setPriceRange,
    setSubcategory,
    setFilterValue,
    applySelection,
    clearFilters,
    hasActiveFilters,
    resetPage,
  };
}
