'use client';

import { useEffect, useState } from 'react';
import { getCashMovements, getCurrentCashRegister, CashMovementResponse, CashRegisterResponse } from '@/lib/api';
import { Loader2, XCircle } from 'lucide-react';
import { ClosedCashRegister } from '@/components/financial/ClosedCashRegister';
import { OpenCashRegister } from '@/components/financial/OpenCashRegister';

export default function FinanceiroPage() {
  const [cashRegister, setCashRegister] = useState<CashRegisterResponse | null>(null);
  const [movements, setMovements] = useState<CashMovementResponse[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = async (page = 1) => {
    if (!cashRegister) return;
    try {
      // Idealmente, ter um loading state específico para a lista
      const movementsData = await getCashMovements(cashRegister.id, { page, limit: pagination.limit });
      setMovements(movementsData.movements);
      setPagination(prev => ({ ...prev, page, total: movementsData.total }));
    } catch (e) {
      setError('Falha ao buscar as movimentações.');
    }
  };

  const fetchCashRegisterData = async () => {
    try {
      setIsLoading(true);
      const registerData = await getCurrentCashRegister();
      setCashRegister(registerData);

      if (registerData) {
        const movementsData = await getCashMovements(registerData.id, { page: 1, limit: pagination.limit });
        setMovements(movementsData.movements);
        setPagination(prev => ({ ...prev, total: movementsData.total }));
      }
    } catch (e: any) {
      if (e.response && e.response.status === 404) {
        setCashRegister(null);
      } else {
        setError('Falha ao buscar dados do caixa.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashRegisterData();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchMovements(newPage);
  };

  const handleCashRegisterOpened = (newCashRegister: CashRegisterResponse) => {
    setCashRegister(newCashRegister);
    setMovements(newCashRegister.movements || []);
    setPagination({ page: 1, limit: 10, total: newCashRegister.movements?.length || 0 });
  };

  const handleCashRegisterClosed = () => {
    setCashRegister(null);
    setMovements([]);
  };

  const handleMovementAdded = (newMovement: CashMovementResponse) => {
    // Para simplificar, recarregamos os dados para refletir a nova movimentação e a paginação correta
    fetchCashRegisterData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
            <h3 className="font-semibold text-red-800">Erro</h3>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestão de Caixa</h1>
          <p className="text-sm text-gray-600">Acompanhe o fluxo de caixa, registre movimentações e visualize o saldo atual</p>
        </div>
      </div>

      {cashRegister ? (
        <OpenCashRegister
          cashRegister={cashRegister}
          movements={movements}
          pagination={pagination}
          onCashRegisterClosed={handleCashRegisterClosed}
          onMovementAdded={handleMovementAdded}
          onPageChange={handlePageChange}
        />
      ) : (
        <ClosedCashRegister onCashRegisterOpened={handleCashRegisterOpened} />
      )}
    </div>
  );
}

