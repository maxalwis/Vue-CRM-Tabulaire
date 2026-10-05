import React, { useState } from 'react';
import type { ColumnType } from '../../types';

interface ColumnManagerProps {
  onCreate: (name: string, type: ColumnType) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ onCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ColumnType>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), type);
    setName('');
    setType('text');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        + Ajouter une colonne
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        background: '#f3f4f6',
        padding: '8px 12px',
        borderRadius: '6px',
      }}
    >
      <input
        type="text"
        placeholder="Nom de la colonne"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ColumnType)}
        style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="text">Texte</option>
        <option value="number">Nombre</option>
        <option value="date">Date</option>
        <option value="phone">Téléphone</option>
      </select>
      <button
        type="submit"
        style={{
          padding: '6px 12px',
          backgroundColor: '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Créer
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        style={{
          padding: '6px 12px',
          backgroundColor: '#9ca3af',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Annuler
      </button>
    </form>
  );
};
