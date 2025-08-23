'use client';

import { useState, useEffect } from 'react';
import { getTables, TableResponse } from '@/lib/api';
import { TableCard } from '@/components/tables/TableCard';
import { PlusCircle, Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function MesasPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoading(true);
        const data = await getTables();
        setTables(data);
      } catch (e) {
        console.error('Failed to fetch tables:', e);
        setError('Não foi possível carregar as mesas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  const canManageTables = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando mesas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mapa de Mesas</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            <Filter size={18} className="mr-2" />
            Filtros
          </button>
          {canManageTables && (
            <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <PlusCircle size={18} className="mr-2" />
              Adicionar Mesa
            </button>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              tableNumber={table.number}
              capacity={table.capacity}
              status={table.status}
              area={table.area.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhuma mesa encontrada.</p>
          {canManageTables && <p className="text-sm text-gray-400 mt-2">Clique em "Adicionar Mesa" para começar.</p>}
        </div>
      )}
    </div>
  );
}

