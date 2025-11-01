'use client';

import { useEffect, useState } from 'react';
import { getMenuItems, MenuItemResponse, getCategories, CategoryResponse } from '@/lib/api';
import { MenuTable } from '@/components/menu/MenuTable';
import { PlusCircle, Filter, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ProductForm } from '@/components/menu/ProductForm';

export default function CardapioPage() {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItemResponse | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const [items, categoriesData] = await Promise.all([getMenuItems(), getCategories()]);

        const itemsArray = Array.isArray(items) ? items : [];
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

        setMenuItems(itemsArray);
        setCategories(categoriesArray);
      } catch (e) {
        console.error('Failed to fetch menu items:', e);
        setError('Não foi possível carregar os itens do cardápio.');
        setMenuItems([]);
        setCategories([]);
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
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cardápio...</p>
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gerenciamento de Cardápio</h1>
          <p className="text-sm text-gray-600">Gerencie os produtos do seu cardápio, categorias e preços</p>
        </div>
        {canManageMenu && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition">
              <Filter className="h-4 w-4" />
              Categorias
            </button>
            <button onClick={() => handleOpenForm()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition">
              <PlusCircle className="h-4 w-4" />
              Adicionar Item
            </button>
          </div>
        )}
      </div>

      {/* Menu Table */}
      <MenuTable menuItems={menuItems} categories={categories} onEdit={handleOpenForm} />

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