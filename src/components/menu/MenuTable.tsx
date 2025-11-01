
'use client';

import { useState, useEffect, useMemo } from 'react';
import { MenuItemResponse, deleteMenuItem, CategoryResponse } from '@/lib/api';
import { CategoryPill } from './CategoryPill';
import { Edit, Trash2, Package, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface MenuTableProps {
  menuItems: MenuItemResponse[];
  categories: CategoryResponse[];
  onEdit: (product: MenuItemResponse) => void;
}

export function MenuTable({ menuItems: initialMenuItems, categories, onEdit }: MenuTableProps) {
  // Garantir que menuItems seja sempre um array
  const [menuItems, setMenuItems] = useState(Array.isArray(initialMenuItems) ? initialMenuItems : []);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const canManageMenu = user?.role === 'admin' || user?.role === 'manager';

  const categoryMap = useMemo(() => {
    if (!Array.isArray(categories)) return new Map<string, string>();
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  // Sincronizar com as props quando elas mudarem
  useEffect(() => {
    setMenuItems(Array.isArray(initialMenuItems) ? initialMenuItems : []);
  }, [initialMenuItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item do cardápio?')) {
      return;
    }

    const originalItems = [...menuItems];
    // Optimistic update
    setMenuItems(prevItems => prevItems.filter(item => item.id !== id));

    try {
      await deleteMenuItem(id);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError('Falha ao excluir o item. A lista será atualizada.');
      // Revert on failure
      setMenuItems(originalItems);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4 mx-4 mt-4">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
          </div>
      )}
      <div className="overflow-x-auto rounded-b-2xl">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs font-semibold uppercase text-gray-600 tracking-wider bg-gray-100/50 rounded-t-2xl">
            <tr>
              <th scope="col" className="px-6 py-3">Produto</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Preço</th>
              <th scope="col" className="px-6 py-3">Status</th>
              {canManageMenu && <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>}
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan={canManageMenu ? 5 : 4} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Package className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Nenhum produto cadastrado</p>
                    <p className="text-sm text-center">Comece adicionando novos produtos ao seu cardápio.</p>
                  </div>
                </td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 relative group">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                    {item.name}
                  </th>
                  <td className="px-6 py-4 text-gray-700">
                    <CategoryPill name={categoryMap.get(item.categoryId) ?? 'Sem categoria'} />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-md ${item.isAvailable ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}>
                      {item.isAvailable ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  {canManageMenu && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => onEdit(item)} className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
