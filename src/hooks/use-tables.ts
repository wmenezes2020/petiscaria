import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Table } from '@/types';
import { useWebSocket } from './use-websocket';

export function useTables() {
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get<{ tables?: Table[]; data?: Table[] }>('/tables');
      return response.tables || response.data || [];
    },
    refetchInterval: 5000,
  });

  // Real-time updates via WebSocket
  useWebSocket('tables', (data) => {
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  });

  return {
    tables: tables || [],
    isLoading,
  };
}

