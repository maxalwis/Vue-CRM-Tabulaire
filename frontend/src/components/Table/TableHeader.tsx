import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Column, SortDir } from '../../types';
import styles from '../../CRMTable.module.css';

interface TableHeaderProps {
  columns: Column[];
  sortBy?: string;
  sortDir?: SortDir;
  onSort: (columnId: string) => void;
  onReorder: (columnIds: string[]) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sortBy,
  sortDir,
  onSort,
  onReorder,
  onDeleteColumn,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items.map((col) => col.id));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="columns-header" direction="horizontal">
        {(provided) => (
          <tr
            className={styles.gridHeader}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <th className={styles.headerCell} style={{ width: '60px', minWidth: '60px' }}>
              #
            </th>
            {columns.map((col, index) => (
              <Draggable key={col.id} draggableId={col.id} index={index}>
                {(providedDraggable) => (
                  <th
                    className={styles.headerCell}
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                  >
                    <div className={styles.headerContent}>
                      <span className={styles.sortableTitle} onClick={() => onSort(col.id)}>
                        {col.name}
                        {sortBy === col.id ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                      </span>
                      <button
                        className={`${styles.btn} ${styles.btnDanger}`}
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                        onClick={() => onDeleteColumn(col.id)}
                        title="Supprimer la colonne"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <th className={styles.headerCell} style={{ width: '80px' }}>
              Actions
            </th>
          </tr>
        )}
      </Droppable>
    </DragDropContext>
  );
};
