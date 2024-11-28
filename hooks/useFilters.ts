import { useState, useMemo, useCallback } from 'react';
import type { FilterField, SingleFilter, CombinedFilter, ConcatenationType } from '../types/filter';
import { useFilter } from './useFilter';

export function useFilters() {
  const firstFilter = useFilter();
  const secondFilter = useFilter();
  const [concatenationType, setConcatenationType] = useState<ConcatenationType>('AND');
  const [showSecondFilter, setShowSecondFilter] = useState(false);

  const isFirstFilterComplete = useMemo(() => {
    return firstFilter.currentFilter !== null;
  }, [firstFilter.currentFilter]);

  const currentCombinedFilter = useMemo((): CombinedFilter | null => {
    const filters: SingleFilter[] = [];
    
    if (firstFilter.currentFilter) {
      filters.push(firstFilter.currentFilter);
    }
    
    if (secondFilter.currentFilter && showSecondFilter) {
      filters.push(secondFilter.currentFilter);
    }
    
    if (filters.length === 0) return null;
    
    return {
      filters,
      concatenationType,
    };
  }, [firstFilter.currentFilter, secondFilter.currentFilter, concatenationType, showSecondFilter]);

  const resetFilters = useCallback(() => {
    firstFilter.resetFilter();
    secondFilter.resetFilter();
    setConcatenationType('AND');
    setShowSecondFilter(false);
  }, [firstFilter, secondFilter]);

  return {
    firstFilter,
    secondFilter,
    concatenationType,
    setConcatenationType,
    isFirstFilterComplete,
    currentCombinedFilter,
    resetFilters,
    showSecondFilter,
    setShowSecondFilter,
  };
}

