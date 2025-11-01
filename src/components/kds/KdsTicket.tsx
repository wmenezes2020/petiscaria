
'use client';

import { OrderResponse, OrderItem } from '@/lib/api';
import { OrderStatus } from '@/components/orders/OrderStatusBadge';
import { Clock, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KdsTicketProps {
  order: OrderResponse;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const calculateTimeDiff = (startTime: string) => {
  const diff = new Date().getTime() - new Date(startTime).getTime();
  return Math.floor(diff / 60000); // difference in minutes
}

export function KdsTicket({ order, onUpdateStatus }: KdsTicketProps) {
  const [timeElapsed, setTimeElapsed] = useState(calculateTimeDiff(order.createdAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(calculateTimeDiff(order.createdAt));
    }, 60000); // update every minute
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const getNextAction = () => {
    switch (order.status) {
      case 'PENDING':
        return { text: 'Iniciar Preparo', nextStatus: 'PREPARING' as OrderStatus, color: 'bg-orange-600 hover:bg-orange-700' };
      case 'PREPARING':
        return { text: 'Marcar como Pronto', nextStatus: 'READY' as OrderStatus, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'READY':
        return { text: 'Marcar como Entregue', nextStatus: 'DELIVERED' as OrderStatus, color: 'bg-green-600 hover:bg-green-700' };
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (order.status) {
      case 'PENDING': return 'border-orange-500';
      case 'PREPARING': return 'border-blue-500';
      case 'READY': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  const action = getNextAction();
  const borderColor = getBorderColor();

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 border-t-4 ${borderColor} w-80 flex-shrink-0 overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">
          {order.table ? `Mesa ${order.table.number}` : order.tableName ? `Mesa ${order.tableName}` : 'Balcão'}
        </h3>
        <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
          <Clock size={16} className="mr-1.5 text-gray-400" />
          <span>{timeElapsed} min</span>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start">
            <span className="text-lg font-bold text-gray-900 mr-2.5 flex-shrink-0">{item.quantity}x</span>
            <div>
              <p className="text-base text-gray-800 font-medium leading-tight">{item.name}</p>
              {item.notes && <p className="text-sm text-gray-500 mt-0.5 italic">- {item.notes}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {action && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => onUpdateStatus(order.id, action.nextStatus)}
            className="btn-primary w-full flex items-center justify-center py-2.5 text-lg"
          >
            {action.text} <ArrowRight size={20} className="ml-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
