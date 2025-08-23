'use client';

import { useState, useEffect } from 'react';
import { getCurrentCashRegister, CashRegisterResponse, CashMovementResponse, getCashMovements } from '@/lib/api';
import { Loader2 } from 'lucide-react';
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
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestão de Caixa</h1>

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

