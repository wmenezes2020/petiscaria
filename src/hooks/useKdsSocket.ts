import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { OrderResponse } from '@/lib/api';

export function useKdsSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [openOrders, setOpenOrders] = useState<OrderResponse[]>([]);
  const [preparingOrders, setPreparingOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore.getState();

  useEffect(() => {
    if (!accessToken) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/kitchen`, {
      auth: {
        token: accessToken,
      },
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao KDS WebSocket');
    });

    newSocket.on('kitchen_orders', (initialOrders: OrderResponse[]) => {
      setOpenOrders(initialOrders.filter(o => o.status === 'PENDING'));
      setPreparingOrders(initialOrders.filter(o => o.status === 'PREPARING'));
    });
    
    newSocket.on('new_order', (newOrder: OrderResponse) => {
      setOpenOrders(prev => [newOrder, ...prev]);
    });
    
    newSocket.on('order_updated', (updatedOrder: OrderResponse) => {
      // Remove o pedido de ambas as listas
      setOpenOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
      setPreparingOrders(prev => prev.filter(o => o.id !== updatedOrder.id));

      // Adiciona o pedido à lista correta
              if (updatedOrder.status === 'PENDING') {
            setOpenOrders(prev => [updatedOrder, ...prev]);
        } else if (updatedOrder.status === 'PREPARING') {
        setPreparingOrders(prev => [updatedOrder, ...prev]);
      }
      // Adicionar lógica para 'READY' se houver uma coluna para isso
    });

    newSocket.on('connect_error', (err) => {
      console.error('Erro de conexão com o KDS WebSocket:', err.message);
      setError('Não foi possível conectar ao serviço de tempo real.');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  return { socket, openOrders, preparingOrders, error };
}
