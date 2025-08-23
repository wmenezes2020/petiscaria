'use client';

import { useState, useEffect } from 'react';
import { getMenuItems, MenuItemResponse } from '@/lib/api';
import { MenuTable } from '@/components/menu/MenuTable';
import { PlusCircle, Filter } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ProductForm } from '@/components/menu/ProductForm';

export default function CardapioPage() {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItemResponse | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const items = await getMenuItems();
        // Garantir que items seja sempre um array
        const itemsArray = Array.isArray(items) ? items : [];
        setMenuItems(itemsArray);
      } catch (e) {
        console.error('Failed to fetch menu items:', e);
        setError('Não foi possível carregar os itens do cardápio.');
        // Definir array vazio em caso de erro
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const canManageMenu = user?.role === 'admin' || user?.role === 'manager';

  const handleOpenForm = (product?: MenuItemResponse) => {
    setSelectedProduct(product || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = (savedProduct: MenuItemResponse) => {
    if (selectedProduct) {
      // Edit
      setMenuItems(items => items.map(item => item.id === savedProduct.id ? savedProduct : item));
    } else {
      // Create
      setMenuItems(items => [savedProduct, ...items]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando cardápio...</p>
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
        <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Cardápio</h1>
        {canManageMenu && (
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              <Filter size={18} className="mr-2" />
              Categorias
            </button>
            <button onClick={() => handleOpenForm()} className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <PlusCircle size={18} className="mr-2" />
              Adicionar Item
            </button>
          </div>
        )}
      </div>

      {/* Menu Table */}
      <MenuTable menuItems={menuItems} onEdit={handleOpenForm} />

      {isFormOpen && (
        <ProductForm
          product={selectedProduct}
          onClose={handleCloseForm}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}