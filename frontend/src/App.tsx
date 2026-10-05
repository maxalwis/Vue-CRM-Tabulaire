import { useState } from 'react';
import { useColumns } from './hooks/useColumns';
import { useContacts } from './hooks/useContacts';
import { VirtualTable } from './components/Table/VirtualTable';
import { Toolbar } from './components/Controls/Toolbar';
import type { Filter, SortDir } from './types';
import styles from './CRMTable.module.css';

export default function App() {
  const { columns, addColumn, reorderColumns, deleteColumn } = useColumns();

  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filters, setFilters] = useState<Filter[]>([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addContact,
    updateCell,
    deleteContact,
  } = useContacts(sortBy, sortDir, filters);

  const contacts = data?.pages.flatMap((page) => page.items) ?? [];

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnId);
      setSortDir('asc');
    }
  };

  return (
    <div className={styles.crmContainer}>
      <h1>CRM Contacts Tableur</h1>

      <Toolbar
        columns={columns}
        onAddColumn={(name, type) => addColumn({ name, type })}
        onAddContact={() => addContact({})}
        onFilterChange={setFilters}
      />

      <VirtualTable
        columns={columns}
        contacts={contacts}
        sortBy={sortBy}
        sortDir={sortDir}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onSort={handleSort}
        onReorder={reorderColumns}
        onDeleteColumn={deleteColumn}
        onUpdateCell={(id, colId, value) => updateCell({ id, values: { [colId]: value } })}
        onDeleteContact={deleteContact}
        onFetchNextPage={fetchNextPage}
      />
    </div>
  );
}
