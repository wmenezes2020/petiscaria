
'use client';

import { useState, useEffect } from 'react';
import { MenuItemResponse, deleteMenuItem } from '@/lib/api';
import { CategoryPill } from './CategoryPill';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface MenuTableProps {
  menuItems: MenuItemResponse[];
  onEdit: (product: MenuItemResponse) => void;
}

export function MenuTable({ menuItems: initialMenuItems, onEdit }: MenuTableProps) {
  // Garantir que menuItems seja sempre um array
  const [menuItems, setMenuItems] = useState(Array.isArray(initialMenuItems) ? initialMenuItems : []);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const canManageMenu = user?.role === 'admin' || user?.role === 'manager';

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
    <div className="bg-white rounded-lg shadow-sm">
      {error && <p className="p-4 text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Produto</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Preço</th>
              <th scope="col" className="px-6 py-3">Status</th>
              {canManageMenu && <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>}
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                  {item.name}
                </th>
                <td className="px-6 py-4">
                  <CategoryPill name={item.categoryId} />
                </td>
                <td className="px-6 py-4 font-semibold">{formatCurrency(item.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </td>
                {canManageMenu && (
                  <td className="px-6 py-4 text-right">
                    {/* Dropdown for actions can be added here */}
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
