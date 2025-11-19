import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Order, OrderItem } from '@/types';
import { toast } from 'react-hot-toast';
import { useWebSocket } from './use-websocket';

export function useOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<{ orders?: Order[]; data?: Order[] }>('/orders');
      return response.orders || response.data || [];
    },
    refetchInterval: 10000,
  });

  // Real-time updates via WebSocket
  useWebSocket('orders', (data) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return api.post<Order>('/orders', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.data?.message || 'Erro ao criar pedido');
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.data?.message || 'Erro ao atualizar status');
    },
  });

  return {
    orders: orders || [],
    isLoading,
    createOrder: createOrderMutation.mutate,
    updateOrderStatus: updateOrderStatusMutation.mutate,
  };
}

