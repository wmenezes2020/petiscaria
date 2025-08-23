'use client';

import { KdsStationColumn } from '@/components/kds/KdsStationColumn';
import { OrderStatus } from '@/components/orders/OrderStatusBadge';
import { useKdsSocket } from '@/hooks/useKdsSocket';

export default function KdsPage() {
  const { openOrders, preparingOrders, error, socket } = useKdsSocket();

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (socket) {
      socket.emit('update_order_status', { orderId, status: newStatus });
    }
  };

  // A lógica de atualização otimista agora será acionada pelos eventos 'order_updated' no hook
  // A UI refletirá o estado do hook (openOrders, preparingOrders)

  if (error) {
    return <div className="text-center text-red-400">{error}</div>;
  }

  if (!socket) {
    return <div className="text-center text-white">Conectando ao serviço de tempo real...</div>;
  }

  return (
    <div className="h-full w-full bg-gray-800 p-4 flex space-x-4 overflow-x-auto">
      <KdsStationColumn title="Recebidos" orders={openOrders} onUpdateStatus={handleUpdateStatus} />
      <KdsStationColumn title="Em Preparo" orders={preparingOrders} onUpdateStatus={handleUpdateStatus} />
      {/* Uma coluna para "Prontos" pode ser adicionada aqui, populada por eventos do WebSocket */}
    </div>
  );
}