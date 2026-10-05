import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchColumns,
  createColumn,
  updateColumn,
  reorderColumns,
  deleteColumn,
} from '../api/columns';
import type { ColumnType } from '../types';

export function useColumns() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  });

  const addMutation = useMutation({
    mutationFn: ({ name, type }: { name: string; type: ColumnType }) =>
      createColumn(name, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateColumn(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (columnIds: string[]) => reorderColumns(columnIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteColumn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['columns'] }),
  });

  return {
    columns: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    addColumn: addMutation.mutate,
    renameColumn: renameMutation.mutate,
    reorderColumns: reorderMutation.mutate,
    deleteColumn: deleteMutation.mutate,
  };
}
