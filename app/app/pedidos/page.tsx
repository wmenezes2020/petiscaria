'use client';

import { useState, useEffect } from 'react';
import { getOrders, PaginatedOrdersResponse, OrderResponse } from '@/lib/api';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { PlusCircle, Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { CreateOrderForm } from '@/components/orders/CreateOrderForm';

export default function PedidosPage() {
  const [ordersData, setOrdersData] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Verificar status de autenticação
    checkAuthStatus();

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await getOrders();
        setOrdersData(data);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
        setError('Não foi possível carregar os pedidos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Removido checkAuthStatus para evitar dependência circular

  const canManageOrders = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'waiter';

  const handleSaveOrder = (newOrder: OrderResponse) => {
    // Adicionar o novo pedido ao início da lista
    if (ordersData) {
      setOrdersData([newOrder, ...ordersData]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (error || !ordersData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error || 'Nenhum dado de pedido encontrado.'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Histórico de Pedidos</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            <Filter size={18} className="mr-2" />
            Filtros
          </button>
          {canManageOrders && (
            <button onClick={() => setIsFormOpen(true)} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <PlusCircle size={18} className="mr-2" />
              Adicionar Pedido
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={ordersData} />

      {isFormOpen && (
        <CreateOrderForm
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveOrder}
        />
      )}
    </div>
  );
}