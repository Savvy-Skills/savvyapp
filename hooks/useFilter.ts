import { useState, useMemo, useCallback } from 'react';
import type { FilterField, Operator, SingleFilter } from '../types/filter';

export function useFilter() {
  const [selectedField, setSelectedField] = useState<FilterField | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator>('=');
  const [filterValue, setFilterValue] = useState<string>('');

  const operators = useMemo(() => {
    if (!selectedField) return [];
    
    if (selectedField.type === 'numeric') {
      return ['=', '!=', '>', '>=', '<', '<='] as const;
    }
    return ['is', 'is not', 'starts with', 'ends with', 'contains', 'not contains'] as const;
  }, [selectedField]);

  const shouldShowInput = useMemo(() => {
    if (!selectedField) return false;
    if (selectedField.type === 'numeric') return true;
    return !['is', 'is not'].includes(selectedOperator);
  }, [selectedField, selectedOperator]);

  const currentFilter = useMemo((): SingleFilter | null => {
    if (!selectedField || !filterValue) return null;
    
    return {
      field: selectedField,
      operator: selectedOperator,
      value: selectedField.type === 'numeric' ? Number(filterValue) : filterValue,
    };
  }, [selectedField, selectedOperator, filterValue]);

  const resetFilter = useCallback(() => {
    setSelectedField(null);
    setSelectedOperator('=');
    setFilterValue('');
  }, []);

  const handleFieldChange = useCallback((field: FilterField | null) => {
    const currentType = selectedField?.type;
    const newType = field?.type;
    
    // Always reset the filter value when changing fields
    setFilterValue('');
    
    if (currentType !== newType) {
      setSelectedOperator(field?.type === 'numeric' ? '=' : 'is');
    }
    
    setSelectedField(field);
  }, [selectedField?.type, setFilterValue]);

  return {
    selectedField,
    setSelectedField: handleFieldChange,
    selectedOperator,
    setSelectedOperator,
    filterValue,
    setFilterValue,
    operators,
    shouldShowInput,
    currentFilter,
    resetFilter,
  };
}

