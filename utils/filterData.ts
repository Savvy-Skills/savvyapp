import type { CombinedFilter, SingleFilter } from '../types/filter';

function applySingleFilter(data: any[], filter: SingleFilter) {
  if (!filter.field) return data;

  return data.filter(row => {
    const value = row[filter.field!.accessor];
    const filterValue = filter.value;

    if (value === null || value === undefined) return false;

    if (filter.field!.type === 'numeric') {
      const numValue = Number(value);
      const numFilterValue = Number(filterValue);

      if (isNaN(numValue) || isNaN(numFilterValue)) return false;

      switch (filter.operator) {
        case '=': return numValue === numFilterValue;
        case '!=': return numValue !== numFilterValue;
        case '>': return numValue > numFilterValue;
        case '>=': return numValue >= numFilterValue;
        case '<': return numValue < numFilterValue;
        case '<=': return numValue <= numFilterValue;
        default: return true;
      }
    }

    const strValue = String(value).toLowerCase();
    const strFilterValue = String(filterValue).toLowerCase();

    switch (filter.operator) {
      case 'is': return strValue === strFilterValue;
      case 'is not': return strValue !== strFilterValue;
      case 'starts with': return strValue.startsWith(strFilterValue);
      case 'ends with': return strValue.endsWith(strFilterValue);
      case 'contains': return strValue.includes(strFilterValue);
      case 'not contains': return !strValue.includes(strFilterValue);
      default: return true;
    }
  });
}

export function filterData(data: any[], filter: CombinedFilter | null) {
  if (!filter || filter.filters.length === 0) return data;

  if (filter.filters.length === 1) {
    return applySingleFilter(data, filter.filters[0]);
  }

  const firstResult = applySingleFilter(data, filter.filters[0]);
  const secondResult = applySingleFilter(data, filter.filters[1]);

  if (filter.concatenationType === 'AND') {
    return firstResult.filter(item => secondResult.includes(item));
  } else {
    return Array.from(new Set([...firstResult, ...secondResult]));
  }
}

