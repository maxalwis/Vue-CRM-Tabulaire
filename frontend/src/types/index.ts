export type ColumnType = 'text' | 'number' | 'date' | 'phone';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  position: number;
}

export interface Contact {
  id: number;
  values: Record<string, any>;
}

export interface Filter {
  columnId: string;
  op: 'eq' | 'neq' | 'contains' | 'gte' | 'lte';
  value: any;
}

export type SortDir = 'asc' | 'desc';
