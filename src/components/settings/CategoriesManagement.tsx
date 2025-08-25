'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, FolderOpen, Image as ImageIcon } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, CategoryResponse } from '@/lib/api';

interface CategoryFormData {
    name: string;
    description: string;
    image?: string;
    isActive: boolean;
    order: number;
}

export function CategoriesManagement() {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        image: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await getCategories();
            // A API retorna um array direto, não um objeto com propriedade categories
            setCategories(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Erro ao carregar categorias');
            console.error('Erro ao buscar categorias:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome da categoria é obrigatório');
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
            } else {
                await createCategory(formData);
            }

            await fetchCategories();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar categoria');
            console.error('Erro ao salvar categoria:', err);
        }
    };

    const handleEdit = (category: CategoryResponse) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            isActive: category.isActive,
            order: category.order || 0
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
            return;
        }

        try {
            await deleteCategory(id);
            await fetchCategories();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir categoria');
            console.error('Erro ao excluir categoria:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', image: '', isActive: true, order: 0 });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingCategory(null);
        setFormData({ name: '', description: '', image: '', isActive: true, order: 0 });
    };

    const toggleActiveStatus = async (category: CategoryResponse) => {
        try {
            await updateCategory(category.id, { isActive: !category.isActive });
            await fetchCategories();
        } catch (err) {
            setError('Erro ao alterar status da categoria');
            console.error('Erro ao alterar status:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestão de Categorias</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Categoria
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erro</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {categories.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            Nenhuma categoria cadastrada
                        </li>
                    ) : (
                        categories.map((category) => (
                            <li key={category.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {category.isActive ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-gray-500">{category.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400">Ordem: {category.order}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleActiveStatus(category)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md ${category.isActive
                                                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                }`}
                                        >
                                            {category.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome da Categoria *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Bebidas"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Descrição opcional da categoria..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ordem de Exibição
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                        Categoria ativa
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {editingCategory ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
