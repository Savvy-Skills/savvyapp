export type DataType = 'numeric' | 'categorical';
export type ConcatenationType = 'AND' | 'OR';

export type NumericOperator = '=' | '!=' | '>' | '>=' | '<' | '<=';
export type CategoricalOperator = 'is' | 'is not' | 'starts with' | 'ends with' | 'contains' | 'not contains';
export type Operator = NumericOperator | CategoricalOperator;

export interface FilterField {
  name: string;
  accessor: string;
  type: DataType;
  uniqueValues?: string[];
}

export interface SingleFilter {
  field: FilterField | null;
  operator: Operator;
  value: string | number;
}

export interface CombinedFilter {
  filters: SingleFilter[];
  concatenationType: ConcatenationType;
}

export interface FilterProps {
  fields: FilterField[];
  onFilterChange: (filter: CombinedFilter | null) => void;
  disabled?: boolean;
}

