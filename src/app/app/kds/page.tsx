'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ChefHat } from 'lucide-react';
import type { Order } from '@/types';
import { formatTime } from '@/lib/utils';

async function fetchKitchenOrders(): Promise<Order[]> {
  try {
    const response = await api.get<{ orders?: Order[]; data?: Order[] }>('/kitchen/orders');
    return response.orders || response.data || [];
  } catch {
    return [];
  }
}

export default function KdsPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: fetchKitchenOrders,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  });

  const preparingOrders = orders?.filter((o) => o.status === 'preparing') || [];
  const readyOrders = orders?.filter((o) => o.status === 'ready') || [];

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KDS - Cozinha</h1>
        <p className="text-muted-foreground">Sistema de exibição para cozinha</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Preparing Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Em Preparo ({preparingOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : preparingOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pedido em preparo
                </p>
              ) : (
                preparingOrders.map((order) => (
                  <Card key={order.id} className="border-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {order.table ? `Mesa ${order.table.number}` : 'Balcão'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.productName}
                            </span>
                            {item.notes && (
                              <span className="text-xs text-muted-foreground">
                                ({item.notes})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como Pronto
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ready Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Prontos ({readyOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : readyOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pedido pronto
                </p>
              ) : (
                readyOrders.map((order) => (
                  <Card key={order.id} className="border-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {order.table ? `Mesa ${order.table.number}` : 'Balcão'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.productName}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      >
                        Marcar como Entregue
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

