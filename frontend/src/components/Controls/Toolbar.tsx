import React, { useState } from 'react';
import type { Column, ColumnType, Filter } from '../../types';
import styles from '../../CRMTable.module.css';

interface ToolbarProps {
  columns: Column[];
  onAddColumn: (name: string, type: ColumnType) => void;
  onAddContact: () => void;
  onFilterChange: (filters: Filter[]) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  columns,
  onAddColumn,
  onAddContact,
  onFilterChange,
}) => {
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState<ColumnType>('text');

  // Filtre
  const [selectedCol, setSelectedCol] = useState('');
  const [filterVal, setFilterVal] = useState('');

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    onAddColumn(colName, colType);
    setColName('');
  };

  const handleApplyFilter = () => {
    if (!selectedCol) {
      onFilterChange([]);
      return;
    }
    onFilterChange([
      {
        columnId: selectedCol,
        op: 'contains',
        value: filterVal,
      },
    ]);
  };

  return (
    <div className={styles.toolbar}>
      {/* Action Contact */}
      <div className={styles.actionGroup}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAddContact}>
          + Nouveau Contact
        </button>
      </div>

      {/* Ajout Colonne */}
      <form onSubmit={handleCreateColumn} className={styles.formControl}>
        <input
          className={styles.input}
          placeholder="Nom colonne..."
          value={colName}
          onChange={(e) => setColName(e.target.value)}
        />
        <select
          className={styles.select}
          value={colType}
          onChange={(e) => setColType(e.target.value as ColumnType)}
        >
          <option value="text">Texte</option>
          <option value="number">Nombre</option>
          <option value="date">Date</option>
          <option value="phone">Téléphone</option>
        </select>
        <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>
          + Colonne
        </button>
      </form>

      {/* Filtre Simple */}
      <div className={styles.formControl}>
        <select
          className={styles.select}
          value={selectedCol}
          onChange={(e) => setSelectedCol(e.target.value)}
        >
          <option value="">Tous les champs (pas de filtre)</option>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {selectedCol && (
          <>
            <input
              className={styles.input}
              placeholder="Valeur..."
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
            />
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleApplyFilter}
            >
              Filtrer
            </button>
          </>
        )}
      </div>
    </div>
  );
};
