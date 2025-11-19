'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Plus } from 'lucide-react';
import type { CashRegister, CashMovement } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { CashRegisterForm } from '@/components/forms/cash-register-form';

async function fetchCurrentCashRegister(): Promise<CashRegister | null> {
  try {
    return await api.get<CashRegister>('/cash-registers/current');
  } catch {
    return null;
  }
}

async function fetchCashMovements(cashRegisterId: string): Promise<{
  movements: CashMovement[];
  total: number;
}> {
  try {
    const response = await api.get<{ movements?: CashMovement[]; data?: CashMovement[]; total?: number }>(
      `/cash-registers/${cashRegisterId}/movements`
    );
    return {
      movements: response.movements || response.data || [],
      total: response.total || 0,
    };
  } catch {
    return { movements: [], total: 0 };
  }
}

export default function FinanceiroPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'open' | 'close' | 'movement'>('open');
  const queryClient = useQueryClient();

  const { data: cashRegister, refetch: refetchCashRegister } = useQuery({
    queryKey: ['current-cash-register'],
    queryFn: fetchCurrentCashRegister,
    refetchInterval: 5000,
  });

  const { data: movementsData, refetch: refetchMovements } = useQuery({
    queryKey: ['cash-movements', cashRegister?.id],
    queryFn: () => fetchCashMovements(cashRegister!.id),
    enabled: !!cashRegister,
  });

  const totalMovements = movementsData?.movements?.reduce((sum, m) => {
    if (['sale', 'deposit'].includes(m.movementType)) {
      return sum + m.amount;
    }
    return sum - Math.abs(m.amount);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro / Caixa</h1>
        <p className="text-muted-foreground">Controle de caixa e movimentações financeiras</p>
      </div>

      {!cashRegister ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Caixa Fechado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setFormType('open');
                setIsFormOpen(true);
              }}
              className="w-full"
            >
              <Unlock className="mr-2 h-4 w-4" />
              Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(cashRegister.openingBalance)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(cashRegister.openedAt)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Saldo Esperado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(cashRegister.expectedBalance || cashRegister.openingBalance)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Movimentado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalMovements)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Movimentações</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormType('movement');
                    setIsFormOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Movimentação
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormType('close');
                    setIsFormOpen(true);
                  }}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fechar Caixa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movementsData?.movements?.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{movement.movementType}</p>
                      {movement.description && (
                        <p className="text-sm text-muted-foreground">{movement.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(movement.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${
                        ['sale', 'deposit'].includes(movement.movementType)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {['sale', 'deposit'].includes(movement.movementType) ? '+' : '-'}
                      {formatCurrency(Math.abs(movement.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <CashRegisterForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        type={formType}
        onSuccess={() => {
          refetchCashRegister();
          if (cashRegister) {
            refetchMovements();
          }
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}

