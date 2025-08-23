
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
    <div className="flex flex-col w-96 bg-gray-100 rounded-lg shadow-inner flex-shrink-0">
      {/* Column Header */}
      <div className="p-4 border-b-2 border-gray-200">
        <h2 className="text-xl font-bold text-gray-700 flex items-center">
          {title}
          <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-base font-semibold rounded-full">
            {orders.length}
          </span>
        </h2>
      </div>

      {/* Tickets Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {orders.length > 0 ? (
            orders.map((order) => (
                <KdsTicket key={order.id} order={order} onUpdateStatus={onUpdateStatus} />
            ))
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nenhum pedido aqui.</p>
            </div>
        )}
      </div>
    </div>
  );
}
