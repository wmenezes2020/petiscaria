
'use client';

import { OrderResponse, PaginatedOrdersResponse } from '@/lib/api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersTableProps {
  orders: OrderResponse[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [total] = useState(orders.length);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const { user } = useAuthStore();

  const canManageOrders = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'waiter';

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
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">ID Pedido</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Cliente/Mesa</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3 text-right">Valor</th>
                {canManageOrders && <th scope="col" className="px-6 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order.id.substring(0, 8)}...
                  </th>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    {order.table ? `Mesa ${order.table.number}` : (order.customer?.name || 'Balcão')}
                  </td>
                  <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right font-semibold">{formatCurrency(order.total)}</td>
                  {canManageOrders && (
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-500 hover:text-gray-800">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Placeholder */}
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-gray-700">
            Mostrando 1 a {orders.length} de {total} pedidos
          </span>
          <div className="inline-flex items-center space-x-2">
            <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <span className='text-sm font-medium'>Página 1 de 1</span>
            <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100 disabled:opacity-50" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />}
    </>
  );
}
