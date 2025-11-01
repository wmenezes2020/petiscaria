
'use client';

import { OrderResponse, PaginatedOrdersResponse } from '@/lib/api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { MoreVertical, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersTableProps {
  orders: OrderResponse[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [total] = useState(Array.isArray(orders) ? orders.length : 0);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const { user } = useAuthStore();

  const canManageOrders = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'waiter';

  // Garantir que orders é um array
  const ordersList = Array.isArray(orders) ? orders : [];

  if (ordersList.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center justify-center mt-8">
        <ShoppingCart className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</p>
        <p className="text-sm text-gray-500">Comece a registrar novos pedidos para vê-los aqui.</p>
      </div>
    );
  }

  // TODO: Implement client-side fetching for pagination and filtering

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleRowClick = (order: OrderResponse) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto rounded-b-2xl">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs font-semibold uppercase text-gray-600 tracking-wider bg-gray-100/50 rounded-t-2xl">
              <tr>
                <th scope="col" className="px-6 py-3">ID Pedido</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Cliente/Mesa</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3 text-right">Valor</th>
                {canManageOrders && <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>}
              </tr>
            </thead>
            <tbody>
              {ordersList.map((order) => (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200 relative group">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order.id.substring(0, 8)}...
                  </th>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {order.table ? `Mesa ${order.table.name}` : (order.customer?.name || 'Balcão')}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(order.total)}</td>
                  {canManageOrders && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Placeholder */}
        <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <span className="text-sm text-gray-700">
            Mostrando 1 a {ordersList.length} de {total} pedidos
          </span>
          <div className="inline-flex items-center space-x-2">
            <button className="btn-ghost" disabled>
              <ChevronLeft size={20} />
            </button>
            <span className='text-sm font-medium text-gray-700'>Página 1 de 1</span>
            <button className="btn-ghost" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />}
    </>
  );
}
