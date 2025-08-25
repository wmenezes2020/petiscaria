'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Users, Square } from 'lucide-react';
import { getTables, createTable, updateTable, deleteTable, getAreas, getLocations, TableResponse, AreaResponse, LocationResponse } from '@/lib/api';

interface TableFormData {
    name: string;
    capacity: number;
    areaId: string;
    locationId: string;
    isActive: boolean;
    isAvailable: boolean;
    description?: string;
    coordinates?: {
        x: number;
        y: number;
    };
}

export function TablesManagement() {
    const [tables, setTables] = useState<TableResponse[]>([]);
    const [areas, setAreas] = useState<AreaResponse[]>([]);
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<TableResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<TableFormData>({
        name: '',
        capacity: 4,
        areaId: '',
        locationId: '',
        isActive: true,
        isAvailable: true,
        description: '',
        coordinates: { x: 0, y: 0 }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [tablesData, areasData, locationsData] = await Promise.all([
                getTables(),
                getAreas(),
                getLocations()
            ]);
            setTables(tablesData);
            setAreas(areasData);
            setLocations(locationsData);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome da mesa é obrigatório');
            return;
        }

        if (!formData.areaId) {
            setError('Área é obrigatória');
            return;
        }

        if (!formData.locationId) {
            setError('Localização é obrigatória');
            return;
        }

        if (formData.capacity <= 0) {
            setError('Capacidade deve ser maior que zero');
            return;
        }

        try {
            if (editingTable) {
                await updateTable(editingTable.id, formData);
            } else {
                await createTable(formData);
            }

            await fetchData();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar mesa');
            console.error('Erro ao salvar mesa:', err);
        }
    };

    const handleEdit = (table: TableResponse) => {
        setEditingTable(table);
        setFormData({
            name: table.name,
            capacity: table.capacity,
            areaId: table.areaId,
            locationId: table.locationId,
            isActive: table.isActive,
            isAvailable: table.isAvailable,
            description: table.description || '',
            coordinates: table.coordinates || { x: 0, y: 0 }
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta mesa?')) {
            return;
        }

        try {
            await deleteTable(id);
            await fetchData();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir mesa');
            console.error('Erro ao excluir mesa:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTable(null);
        setFormData({
            name: '',
            capacity: 4,
            areaId: '',
            locationId: '',
            isActive: true,
            isAvailable: true,
            description: '',
            coordinates: { x: 0, y: 0 }
        });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingTable(null);
        setFormData({
            name: '',
            capacity: 4,
            areaId: '',
            locationId: '',
            isActive: true,
            isAvailable: true,
            description: '',
            coordinates: { x: 0, y: 0 }
        });
    };

    const toggleActiveStatus = async (table: TableResponse) => {
        try {
            await updateTable(table.id, { isActive: !table.isActive });
            await fetchData();
        } catch (err) {
            setError('Erro ao alterar status da mesa');
            console.error('Erro ao alterar status:', err);
        }
    };

    const toggleAvailableStatus = async (table: TableResponse) => {
        try {
            await updateTable(table.id, { isAvailable: !table.isAvailable });
            await fetchData();
        } catch (err) {
            setError('Erro ao alterar disponibilidade da mesa');
            console.error('Erro ao alterar disponibilidade:', err);
        }
    };

    const getAreaName = (areaId: string) => {
        const area = areas.find(area => area.id === areaId);
        return area ? area.name : 'Área não encontrada';
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Mesas</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Mesa
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

            {/* Tables List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {tables.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            Nenhuma mesa cadastrada
                        </li>
                    ) : (
                        tables.map((table) => (
                            <li key={table.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Square className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">{table.name}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${table.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {table.isActive ? 'Ativa' : 'Inativa'}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${table.isAvailable
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {table.isAvailable ? 'Disponível' : 'Ocupada'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1" />
                                                    {table.capacity} pessoas
                                                </span>
                                                <span className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {getAreaName(table.areaId)} - {getLocationName(table.locationId)}
                                                </span>
                                            </div>
                                            {table.description && (
                                                <p className="text-sm text-gray-500 mt-1">{table.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleActiveStatus(table)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md ${table.isActive
                                                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                }`}
                                        >
                                            {table.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => toggleAvailableStatus(table)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md ${table.isAvailable
                                                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                                                : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                                }`}
                                        >
                                            {table.isAvailable ? 'Marcar Ocupada' : 'Marcar Disponível'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(table)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(table.id)}
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
                    <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome da Mesa *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: Mesa 1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Capacidade *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="4"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Localização *
                                        </label>
                                        <select
                                            value={formData.locationId}
                                            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Área *
                                        </label>
                                        <select
                                            value={formData.areaId}
                                            onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Selecione uma área</option>
                                            {areas
                                                .filter(area => area.locationId === formData.locationId)
                                                .map((area) => (
                                                    <option key={area.id} value={area.id}>
                                                        {area.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
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
                                        placeholder="Descrição opcional da mesa..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Coordenada X
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.coordinates?.x || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                coordinates: {
                                                    x: parseInt(e.target.value) || 0,
                                                    y: formData.coordinates?.y || 0
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Coordenada Y
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.coordinates?.y || 0}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                coordinates: {
                                                    x: formData.coordinates?.x || 0,
                                                    y: parseInt(e.target.value) || 0
                                                }
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                            Mesa ativa
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isAvailable"
                                            checked={formData.isAvailable}
                                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                                            Mesa disponível
                                        </label>
                                    </div>
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
                                        {editingTable ? 'Atualizar' : 'Criar'}
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

