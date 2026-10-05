import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Column, SortDir } from '../../types';
import styles from '../../CRMTable.module.css';

// Identifiant utilisé pour trier sur la colonne "#".
// Il doit être accepté par le parent (onSort) et par l'API.
export const ROW_ID_SORT = 'id';

interface TableHeaderProps {
  columns: Column[];
  sortBy?: string;
  sortDir?: SortDir;
  onSort: (columnId: string) => void;
  onReorder: (columnIds: string[]) => void;
  onDeleteColumn: (columnId: string) => void;
}

const SortIndicator: React.FC<{ active: boolean; dir?: SortDir }> = ({ active, dir }) => (
  <span
    aria-hidden="true"
    style={{
      marginLeft: 6,
      fontSize: 12,
      opacity: active ? 1 : 0.35,
    }}
  >
    {!active ? '⇅' : dir === 'asc' ? '▲' : '▼'}
  </span>
);

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

  const ariaSort = (id: string): React.AriaAttributes['aria-sort'] =>
    sortBy === id ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

  const sortButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
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
            {/* Colonne "#" : triable sur l'identifiant */}
            <th
              className={styles.headerCell}
              style={{ width: '60px', minWidth: '60px' }}
              aria-sort={ariaSort(ROW_ID_SORT)}
            >
              <button
                type="button"
                style={sortButtonStyle}
                onClick={() => onSort(ROW_ID_SORT)}
                title="Trier par numéro"
              >
                #
                <SortIndicator active={sortBy === ROW_ID_SORT} dir={sortDir} />
              </button>
            </th>

            {columns.map((col, index) => (
              <Draggable key={col.id} draggableId={col.id} index={index}>
                {(providedDraggable) => (
                  <th
                    className={styles.headerCell}
                    ref={providedDraggable.innerRef}
                    aria-sort={ariaSort(col.id)}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                  >
                    <div className={styles.headerContent}>
                      <button
                        type="button"
                        style={sortButtonStyle}
                        onClick={() => onSort(col.id)}
                        title={`Trier par ${col.name}`}
                      >
                        {col.name}
                        <SortIndicator active={sortBy === col.id} dir={sortDir} />
                      </button>
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
