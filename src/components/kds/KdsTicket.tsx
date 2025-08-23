
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
      case 'OPEN':
        return { text: 'Iniciar Preparo', nextStatus: 'PREPARING' as OrderStatus };
      case 'PREPARING':
        return { text: 'Marcar como Pronto', nextStatus: 'READY' as OrderStatus };
      default:
        return null;
    }
  };

  const action = getNextAction();

  return (
    <div className="bg-white rounded-lg shadow-lg border-t-8 border-orange-500 w-80 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-extrabold text-gray-800">
            {order.table ? `Mesa ${order.table.number}` : 'Balcão'}
          </h3>
          <div className="flex items-center text-lg font-bold text-orange-600">
            <Clock size={20} className="mr-2" />
            <span>{timeElapsed} min</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 mr-3">{item.quantity}x</span>
            <p className="text-xl text-gray-700">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {action && (
        <div className="p-3 bg-gray-50">
          <button 
            onClick={() => onUpdateStatus(order.id, action.nextStatus)}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {action.text} <ArrowRight size={22} className="ml-3"/>
          </button>
        </div>
      )}
    </div>
  );
}
