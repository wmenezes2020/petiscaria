'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, XCircle, Sparkles } from 'lucide-react';
import { getAreas, createArea, updateArea, deleteArea, AreaResponse } from '@/lib/api';
import { createPortal } from 'react-dom';

interface AreaFormData {
    name: string;
    description: string;
}

export function AreasManagement() {
    const [areas, setAreas] = useState<AreaResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AreaFormData>({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const areasData = await getAreas();
            setAreas(Array.isArray(areasData) ? areasData : []);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
            setAreas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome da área é obrigatório');
            return;
        }

        try {
            if (editingArea) {
                await updateArea(editingArea.id, formData);
            } else {
                await createArea(formData);
            }

            await fetchData();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar área');
            console.error('Erro ao salvar área:', err);
        }
    };

    const handleEdit = (area: AreaResponse) => {
        setEditingArea(area);
        setFormData({
            name: area.name,
            description: area.description || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta área?')) {
            return;
        }

        try {
            await deleteArea(id);
            await fetchData();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir área');
            console.error('Erro ao excluir área:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingArea(null);
        setFormData({ name: '', description: '' });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingArea(null);
        setFormData({ name: '', description: '' });
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFormOpen) {
                handleCloseForm();
            }
        };
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isFormOpen]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Áreas</h3>
                    <p className="text-sm text-gray-600">Organize áreas do estabelecimento para facilitar a gestão de mesas</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nova Área
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

            {/* Areas List */}
            <div className="bg-white border border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                {areas.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                        <MapPin className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">Nenhuma área cadastrada</p>
                        <p className="text-sm text-gray-400">Comece criando sua primeira área para organizar as mesas do estabelecimento</p>
                        <button
                            onClick={handleOpenForm}
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Criar Primeira Área
                        </button>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {(Array.isArray(areas) ? areas : []).map((area) => (
                            <li key={area.id} className="px-6 py-4 hover:bg-gray-50 transition relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <MapPin className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 truncate">{area.name}</h4>
                                            {area.description && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{area.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => handleEdit(area)}
                                            className="p-1 text-indigo-600 hover:text-indigo-800"
                                            title="Editar área"
                                            type="button"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(area.id)}
                                            className="p-1 text-red-600 hover:text-red-900"
                                            title="Excluir área"
                                            type="button"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingArea ? 'Editar Área' : 'Nova Área'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label htmlFor="area-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome da Área *
                                </label>
                                <input
                                    id="area-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Ex: Salão Principal"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="area-description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    id="area-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Descrição opcional da área..."
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                        <p className="mt-1 text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg"
                                >
                                    {editingArea ? 'Atualizar' : 'Criar'}
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
