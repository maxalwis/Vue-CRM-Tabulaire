import type { Column, ColumnType } from '../types';

const API_URL = 'http://localhost:3000/columns';

export async function fetchColumns(): Promise<Column[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erreur lors de la récupération des colonnes');
  return res.json();
}

export async function createColumn(name: string, type: ColumnType): Promise<Column> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) throw new Error('Erreur lors de la création de la colonne');
  return res.json();
}

export async function updateColumn(id: string, name: string): Promise<Column> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Erreur lors de la modification de la colonne');
  return res.json();
}

export async function reorderColumns(columnIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columnIds }),
  });
  if (!res.ok) throw new Error('Erreur lors du réordonnancement des colonnes');
}

export async function deleteColumn(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur lors de la suppression de la colonne');
}
