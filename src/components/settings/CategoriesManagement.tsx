'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit, Trash2, FolderOpen, Image as ImageIcon, XCircle, Loader2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, CategoryResponse } from '@/lib/api';
import { createPortal } from 'react-dom';

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
    const [mounted, setMounted] = useState(false); // Para React Portal

    useEffect(() => {
        setMounted(true);
        fetchCategories();
    }, []);

    useEffect(() => {
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    handleCloseForm();
                }
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                window.removeEventListener('keydown', handleEsc);
                document.body.style.overflow = '';
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isFormOpen]);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await getCategories();
            setCategories(Array.isArray(response) ? response : []);
        } catch (err) {
            setError('Erro ao carregar categorias');
            console.error('Erro ao buscar categorias:', err);
            setCategories([]);
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

        const dataToSend = {
            ...formData,
            image: formData.image === '' ? undefined : formData.image,
        };

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, dataToSend);
            } else {
                await createCategory(dataToSend);
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
            <div className="flex justify-center items-center py-8 rounded-2xl shadow-lg border border-gray-100 bg-white min-h-[300px]">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Gestão de Categorias</h3>
                        <p className="text-sm text-gray-600">Organize o cardápio por categorias e destaque itens</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="btn-primary"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Categoria
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="card p-0">
                <ul className="divide-y divide-gray-100">
                    {categories.length === 0 ? (
                        <li className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                            <FolderOpen className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">Nenhuma categoria cadastrada</p>
                            <p className="text-sm text-gray-400">Comece adicionando uma nova categoria para organizar seus produtos.</p>
                            <button
                                onClick={handleOpenForm}
                                className="btn-primary mt-4"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                Adicionar Categoria
                            </button>
                        </li>
                    ) : (
                        categories.map((category) => (
                            <li key={category.id} className="px-6 py-4 hover:bg-gray-50 transition relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {category.image ? (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="h-12 w-12 rounded-xl object-cover border border-gray-100"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-gray-100 flex items-center justify-center text-indigo-600">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-base font-semibold text-gray-900">{category.name}</h4>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${category.isActive ? 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-500/10'}`}>
                                                    {category.isActive ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">{category.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">Ordem: {category.order ?? category.sortOrder ?? 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => toggleActiveStatus(category)}
                                            className="btn-secondary text-xs"
                                        >
                                            {category.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Editar categoria"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Excluir categoria"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Form Modal */}
            {mounted && isFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                </h3>
                            </div>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                            <div>
                                <label className="input-label">
                                    Nome da Categoria *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Ex: Bebidas"
                                    required
                                />
                            </div>

                            <div>
                                <label className="input-label">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="input-field"
                                    placeholder="Descrição opcional da categoria..."
                                />
                            </div>

                            <div>
                                <label className="input-label">
                                    URL da Imagem
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="input-field"
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                            </div>

                            <div>
                                <label className="input-label">
                                    Ordem de Exibição
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="input-field"
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
                                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                    Categoria ativa
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 bg-gray-50 rounded-b-2xl px-6 py-4 -mx-6 -mb-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null} {editingCategory ? 'Atualizar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
