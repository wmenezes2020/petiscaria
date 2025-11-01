
'use client';

import { IngredientResponse } from '@/lib/api';
import { StockLevelBadge, StockLevel } from './StockLevelBadge';
import { Edit, Droplets, Package, PackageSearch } from 'lucide-react';

interface StockTableProps {
  ingredients: IngredientResponse[];
  onEditIngredient?: (ingredient: IngredientResponse) => void;
  onAdjustStock?: (ingredient: IngredientResponse) => void;
}

const formatQuantity = (value: number, unit?: string) => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
  return unit ? `${formatted} ${unit}` : formatted;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

const getStockLevel = (item: IngredientResponse): StockLevel => {
  const current = Number(item.currentStock ?? 0);
  const min = Number(item.minStock ?? 0);
  if (current <= 0) {
    return 'OUT';
  }
  if (current <= min) {
    return 'LOW';
  }
  return 'OK';
};

export function StockTable({ ingredients, onAdjustStock, onEditIngredient }: StockTableProps) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center justify-center mt-8">
        <Package className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-700 mb-2">Nenhum ingrediente em estoque</p>
        <p className="text-sm text-gray-500">Adicione ingredientes para gerenciar seu estoque.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-8">
      <div className="overflow-x-auto rounded-b-2xl">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs font-semibold uppercase text-gray-600 tracking-wider bg-gray-100/50 rounded-t-2xl">
            <tr>
              <th scope="col" className="px-6 py-3">Ingrediente</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Estoque Atual</th>
              <th scope="col" className="px-6 py-3">Mínimo</th>
              <th scope="col" className="px-6 py-3">Custo</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ingredients.map((item) => (
              <tr key={item.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 relative group">
                <th scope="row" className="px-6 py-4 text-gray-900">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base text-gray-900">{item.name}</span>
                    {item.sku && <span className="text-xs text-gray-400">SKU: {item.sku}</span>}
                  </div>
                </th>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <PackageSearch className="h-4 w-4 text-gray-400" />
                    {item.category?.name || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {formatQuantity(item.currentStock, item.unit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatQuantity(item.minStock, item.unit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatCurrency(item.unitCost)}
                </td>
                <td className="px-6 py-4">
                  <StockLevelBadge level={getStockLevel(item)} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onEditIngredient?.(item)}
                      className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Editar insumo"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onAdjustStock?.(item)}
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Ajustar estoque"
                    >
                      <Droplets size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
