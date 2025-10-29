'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin } from 'lucide-react';
import { getAreas, createArea, updateArea, deleteArea, getLocations, AreaResponse, LocationResponse } from '@/lib/api';

interface AreaFormData {
    name: string;
    description: string;
    locationId: string;
}

export function AreasManagement() {
    const [areas, setAreas] = useState<AreaResponse[]>([]);
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AreaFormData>({
        name: '',
        description: '',
        locationId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [areasData, locationsData] = await Promise.all([
                getAreas(),
                getLocations()
            ]);
            // Garantir que os dados são arrays
            setAreas(Array.isArray(areasData) ? areasData : []);
            setLocations(Array.isArray(locationsData) ? locationsData : []);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
            setAreas([]);
            setLocations([]);
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

        if (!formData.locationId) {
            setError('Localização é obrigatória');
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
            description: area.description || '',
            locationId: area.locationId
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
        setFormData({ name: '', description: '', locationId: '' });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingArea(null);
        setFormData({ name: '', description: '', locationId: '' });
    };

    const getLocationName = (locationId: string) => {
        const location = locations.find(loc => loc.id === locationId);
        return location ? location.name : 'Localização não encontrada';
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Áreas</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Área
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

            {/* Areas List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {areas.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            Nenhuma área cadastrada
                        </li>
                    ) : (
                        (Array.isArray(areas) ? areas : []).map((area) => (
                            <li key={area.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{area.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                Localização: {getLocationName(area.locationId)}
                                            </p>
                                            {area.description && (
                                                <p className="text-sm text-gray-500">{area.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(area)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(area.id)}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingArea ? 'Editar Área' : 'Nova Área'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {editingArea ? 'Atualize as informações da área' : 'Preencha os dados para criar uma nova área'}
                            </p>
                        </div>
                        <div className="p-6">

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome da Área *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Ex: Salão Principal"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Localização *
                                    </label>
                                    <select
                                        value={formData.locationId}
                                        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        required
                                    >
                                        <option value="">Selecione uma localização</option>
                                        {locations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                                        placeholder="Descrição opcional da área..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                                    >
                                        {editingArea ? 'Atualizar' : 'Criar'}
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
