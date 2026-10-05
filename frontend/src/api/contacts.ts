import type { Contact, Filter, SortDir } from '../types';

interface FetchContactsParams {
  limit?: number;
  cursor?: string | null;
  sortBy?: string;
  sortDir?: SortDir;
  filters?: Filter[];
}

interface FetchContactsResponse {
  items: Contact[];
  nextCursor: string | null;
  total?: number;
}

export async function fetchContacts({
  limit = 30,
  cursor,
  sortBy,
  sortDir,
  filters,
}: FetchContactsParams): Promise<FetchContactsResponse> {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (cursor) params.append('cursor', cursor);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDir) params.append('sortDir', sortDir);
  if (filters && filters.length > 0) {
    params.append('filters', JSON.stringify(filters));
  }

  const res = await fetch(`http://localhost:3000/contacts?${params.toString()}`);
  if (!res.ok) throw new Error('Erreur lors du chargement des contacts');
  return res.json();
}

export async function createContact(values?: Record<string, any>): Promise<Contact> {
  const res = await fetch('http://localhost:3000/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: values ?? {} }),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du contact');
  return res.json();
}

export async function updateContactCell(id: number, values: Record<string, any>): Promise<Contact> {
  const res = await fetch(`http://localhost:3000/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour');
  return res.json();
}

export async function deleteContact(id: number): Promise<void> {
  const res = await fetch(`http://localhost:3000/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du contact');
}
