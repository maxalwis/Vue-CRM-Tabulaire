import React, { useEffect, useState } from 'react';
import type { Column, ColumnType, Filter } from '../../types';
import styles from '../../CRMTable.module.css';

interface ToolbarProps {
  columns: Column[];
  onAddColumn: (name: string, type: ColumnType) => void;
  onAddContact: () => void;
  onFilterChange: (filters: Filter[]) => void;
}

// Type d'input HTML selon le type de colonne
const INPUT_TYPE: Record<ColumnType, string> = {
  text: 'text',
  number: 'number',
  date: 'date',
  phone: 'text',
};

// Opérateur envoyé selon le type de colonne.
// ATTENTION : 'eq' doit être accepté par ton type Filter et par ton backend.
// Sinon, remets 'contains' pour number/date ou ajoute 'eq' côté API.
const FILTER_OP: Record<ColumnType, Filter['op']> = {
  text: 'contains',
  phone: 'contains',
  number: 'eq' as Filter['op'],
  date: 'eq' as Filter['op'],
};

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

  const selectedColumn = columns.find((c) => c.id === selectedCol);

  // Si la colonne filtrée est supprimée, on réinitialise le filtre
  useEffect(() => {
    if (selectedCol && !selectedColumn) {
      setSelectedCol('');
      setFilterVal('');
      onFilterChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    onAddColumn(colName.trim(), colType);
    setColName('');
  };

  const handleColChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCol(e.target.value);
    setFilterVal(''); // évite de garder une valeur d'une autre colonne/type
    onFilterChange([]); // l'ancien filtre ne doit pas rester actif
  };

  const handleApplyFilter = () => {
    if (!selectedColumn || filterVal.trim() === '') {
      onFilterChange([]);
      return;
    }
    onFilterChange([
      {
        columnId: selectedColumn.id,
        op: FILTER_OP[selectedColumn.type],
        value: filterVal.trim(),
      },
    ]);
  };

  const handleReset = () => {
    setSelectedCol('');
    setFilterVal('');
    onFilterChange([]);
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

      {/* Filtre */}
      <div className={styles.formControl}>
        <select className={styles.select} value={selectedCol} onChange={handleColChange}>
          <option value="">Tous les champs (pas de filtre)</option>
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {selectedColumn && (
          <input
            className={styles.input}
            type={INPUT_TYPE[selectedColumn.type]}
            placeholder="Valeur..."
            value={filterVal}
            onChange={(e) => setFilterVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
          />
        )}

        {selectedColumn && (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleApplyFilter}
          >
            Filtrer
          </button>
        )}

        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleReset}
          disabled={!selectedCol && !filterVal}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
};
