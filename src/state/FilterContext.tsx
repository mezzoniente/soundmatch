import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { EMPTY_FILTERS, MatchFilters } from '../lib/matchEngine';

interface FilterContextValue {
  filters: MatchFilters;
  setFilters: (f: MatchFilters) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

/** Guarda os filtros de busca do feed, compartilhados entre Discover e a tela de filtros. */
export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<MatchFilters>(EMPTY_FILTERS);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters }),
    [filters, resetFilters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilters deve ser usado dentro de <FilterProvider>');
  }
  return ctx;
}
