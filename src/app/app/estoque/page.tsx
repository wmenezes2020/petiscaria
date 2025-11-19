'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import type { StockMovement, Ingredient } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { StockMovementForm } from '@/components/forms/stock-movement-form';

async function fetchStockMovements(): Promise<{ movements: StockMovement[]; total: number }> {
  try {
    const response = await api.get<{ movements?: StockMovement[]; data?: StockMovement[]; total?: number }>('/stock');
    return {
      movements: response.movements || response.data || [],
      total: response.total || 0,
    };
  } catch {
    return { movements: [], total: 0 };
  }
}

async function fetchStockAlerts(): Promise<{
  lowStock: Ingredient[];
  overStock: Ingredient[];
  expiredProducts: any[];
}> {
  try {
    return await api.get<{
      lowStock: Ingredient[];
      overStock: Ingredient[];
      expiredProducts: any[];
    }>('/stock/alerts');
  } catch {
    return { lowStock: [], overStock: [], expiredProducts: [] };
  }
}

export default function EstoquePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: movementsData, refetch } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: fetchStockMovements,
  });

  const { data: alerts } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: fetchStockAlerts,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Controle de estoque e movimentações</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Alerts */}
      {alerts && (alerts.lowStock.length > 0 || alerts.overStock.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.lowStock.length > 0 && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Estoque Baixo ({alerts.lowStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.lowStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {alerts.overStock.length > 0 && (
            <Card className="border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                  Estoque Alto ({alerts.overStock.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.overStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {movementsData?.movements?.slice(0, 10).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">
                    {movement.type === 'in' ? 'Entrada' : 'Saída'} - {movement.reason}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(movement.createdAt)}
                  </p>
                  {movement.reference && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {movement.reference}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {movement.type === 'in' ? '+' : '-'}
                    {movement.quantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(movement.totalCost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StockMovementForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

