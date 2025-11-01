
'use client';

import { OrderResponse } from '@/lib/api';
import { OrderStatus } from '@/components/orders/OrderStatusBadge';
import { KdsTicket } from './KdsTicket';

interface KdsStationColumnProps {
  title: string;
  orders: OrderResponse[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export function KdsStationColumn({ title, orders, onUpdateStatus }: KdsStationColumnProps) {
  return (
    <div className="flex flex-col w-96 bg-gray-50 rounded-2xl shadow-md border border-gray-100 flex-shrink-0">
      {/* Column Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          {title}
          <span className="ml-3 px-3 py-0.5 bg-indigo-500 text-white text-sm font-semibold rounded-full">
            {orders.length}
          </span>
        </h2>
      </div>

      {/* Tickets Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {orders.length > 0 ? (
            orders.map((order) => (
                <KdsTicket key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
            ))
        ) : (
            <div className="flex flex-col items-center justify-center p-6 text-gray-500 bg-gray-100 rounded-xl border border-gray-200">
                <img src="/images/empty-state/chef.svg" alt="No orders" className="w-24 h-24 mb-4 opacity-70" /> {/* Replace with actual SVG */}
                <p className="text-base font-semibold text-gray-700 mb-1">Nenhum pedido aqui</p>
                <p className="text-sm text-gray-500 text-center">Aguardando novos pedidos para esta estação.</p>
            </div>
        )}
      </div>
    </div>
  );
}
