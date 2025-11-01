'use client';

import { useEffect, useState } from 'react';
import { getIngredients, IngredientResponse } from '@/lib/api';
import { StockTable } from '@/components/stock/StockTable';
import { PlusCircle, ShoppingCart, Sliders, XCircle } from 'lucide-react';

export default function EstoquePage() {
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await getIngredients();
        setIngredients(data);
      } catch (e) {
        console.error('Failed to fetch ingredients:', e);
        setError('Não foi possível carregar os insumos do estoque.');
      }
    };

    fetchIngredients();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Controle de Estoque</h1>
          <p className="text-sm text-gray-600">Gerencie seus insumos, visualize o nível de estoque e registre compras</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition">
            <Sliders className="h-4 w-4" />
            Ajuste Rápido
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white shadow-md hover:shadow-lg transition">
            <ShoppingCart className="h-4 w-4" />
            Registrar Compra
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition">
            <PlusCircle className="h-4 w-4" />
            Adicionar Insumo
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <StockTable initialIngredients={ingredients} />
    </div>
  );
}
