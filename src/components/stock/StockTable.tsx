
'use client';

import { useState } from 'react';
import { IngredientResponse } from '@/lib/api';
import { StockLevelBadge, StockLevel } from './StockLevelBadge';
import { MoreVertical, Edit, Droplets } from 'lucide-react';

interface StockTableProps {
  initialIngredients: IngredientResponse[];
}

export function StockTable({ initialIngredients }: StockTableProps) {
  const [ingredients, setIngredients] = useState(initialIngredients);

  const getStockLevel = (item: IngredientResponse): StockLevel => {
    if (item.quantity <= item.criticalStockThreshold) {
      return 'OUT';
    }
    if (item.quantity <= item.lowStockThreshold) {
      return 'LOW';
    }
    return 'OK';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Ingrediente</th>
                <th scope="col" className="px-6 py-3">Qtd. em Estoque</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody>
                {ingredients.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                    </th>
                    <td className="px-6 py-4">
                        <span className="font-semibold">{item.quantity}</span>
                        <span className="text-gray-500 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                        <StockLevelBadge level={getStockLevel(item)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-md">
                                <Edit size={16} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-md">
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
