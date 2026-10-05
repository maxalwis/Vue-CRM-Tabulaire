import React, { useState } from 'react';
import type { ColumnType } from '../../types';
import styles from '../../CRMTable.module.css';

interface TableCellProps {
  value: any;
  type: ColumnType;
  onSave: (newValue: any) => void;
}

export const TableCell: React.FC<TableCellProps> = ({ value, type, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value ?? '');

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setCurrentValue(value ?? '');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <div className={styles.cellViewer} onClick={() => setIsEditing(true)}>
        {value !== undefined && value !== null && value !== '' ? (
          String(value)
        ) : (
          <span className={styles.placeholder}>—</span>
        )}
      </div>
    );
  }

  return (
    <input
      autoFocus
      className={styles.cellEditor}
      type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};
