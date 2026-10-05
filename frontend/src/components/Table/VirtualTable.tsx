import React, { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Column, Contact, SortDir } from '../../types';
import { TableHeader } from './TableHeader';
import { TableCell } from './TableCell';
import styles from '../../CRMTable.module.css';

interface VirtualTableProps {
  columns: Column[];
  contacts: Contact[];
  sortBy?: string;
  sortDir?: SortDir;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onSort: (columnId: string) => void;
  onReorder: (columnIds: string[]) => void;
  onDeleteColumn: (columnId: string) => void;
  onUpdateCell: (id: number, columnId: string, value: any) => void;
  onDeleteContact: (id: number) => void;
  onFetchNextPage: () => void;
}

export const VirtualTable: React.FC<VirtualTableProps> = ({
  columns,
  contacts,
  sortBy,
  sortDir,
  hasNextPage,
  isFetchingNextPage,
  onSort,
  onReorder,
  onDeleteColumn,
  onUpdateCell,
  onDeleteContact,
  onFetchNextPage,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: contacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 42,
    overscan: 5,
  });

  // Détection automatique du scroll pour charger la suite
  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    // Si on est à moins de 200px du bas, on charge la page suivante
    if (scrollHeight - scrollTop - clientHeight < 200) {
      onFetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div ref={parentRef} className={styles.tableWrapper} style={{ height: '700px', overflow: 'auto' }}>
      <table className={styles.gridTable}>
        <thead>
          <TableHeader
            columns={columns}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={onSort}
            onReorder={onReorder}
            onDeleteColumn={onDeleteColumn}
          />
        </thead>
        <tbody>
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
          )}

          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const contact = contacts[virtualRow.index];
            return (
              <tr key={contact.id} className={styles.tableRow}>
                <td className={styles.dataCell} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {contact.id}
                </td>
                {columns.map((col) => (
                  <td key={col.id} className={styles.dataCell}>
                    <TableCell
                      value={contact.values?.[col.id]}
                      type={col.type}
                      onSave={(newValue) => onUpdateCell(contact.id, col.id, newValue)}
                    />
                  </td>
                ))}
                <td className={styles.dataCell} style={{ textAlign: 'center' }}>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    style={{ padding: '2px 6px', fontSize: '11px' }}
                    onClick={() => onDeleteContact(contact.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}

          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr
              style={{
                height: `${
                  rowVirtualizer.getTotalSize() -
                  rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end
                }px`,
              }}
            />
          )}
        </tbody>
      </table>

      {isFetchingNextPage && (
        <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Chargement de la suite...
        </div>
      )}
    </div>
  );
};
