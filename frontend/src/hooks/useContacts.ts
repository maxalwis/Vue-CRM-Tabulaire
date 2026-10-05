import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  createContact,
  updateContactCell,
  deleteContact as deleteContactApi,
} from '../api/contacts';
import type { Filter, SortDir } from '../types';

export function useContacts(sortBy?: string, sortDir?: SortDir, filters?: Filter[]) {
  const queryClient = useQueryClient();

  // 1. Requête Infinite Query avec le typage explicite de pageParam
  const contactsQuery = useInfiniteQuery({
    queryKey: ['contacts', { sortBy, sortDir, filters }],
    queryFn: ({ pageParam }) =>
      fetchContacts({
        limit: 30,
        cursor: pageParam as string | null,
        sortBy,
        sortDir,
        filters,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });

  // 2. Mutations
  const addContactMutation = useMutation({
    mutationFn: (values?: Record<string, any>) => createContact(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const updateCellMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, any> }) =>
      updateContactCell(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => deleteContactApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  // 3. Retour complet
  return {
    ...contactsQuery,
    addContact: addContactMutation.mutate,
    updateCell: updateCellMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
  };
}
