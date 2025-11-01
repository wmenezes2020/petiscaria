'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Users, Square, XCircle } from 'lucide-react';
import { getTables, createTable, updateTable, deleteTable, getAreas, getLocations, TableResponse, AreaResponse, LocationResponse } from '@/lib/api';
import { TableStatusBadge } from '@/components/tables/TableStatusBadge';
import { createPortal } from 'react-dom';

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
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

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [tablesData, areasData, locationsData] = await Promise.all([
                getTables(),
                getAreas(),
                getLocations()
            ]);

            setTables(Array.isArray(tablesData) ? tablesData : []);
            setAreas(Array.isArray(areasData) ? areasData : []);
            setLocations(Array.isArray(locationsData) ? locationsData : []);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
            setTables([]);
            setAreas([]);
            setLocations([]);
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
            areaId: table.areaId ?? '',
            locationId: table.locationId ?? '',
            isActive: table.isActive,
            isAvailable: table.isAvailable,
            description: table.description || '',
            coordinates: {
                x: table.x !== undefined ? Number(table.x) : 0,
                y: table.y !== undefined ? Number(table.y) : 0,
            },
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
            // O backend deve lidar com a conversão de isAvailable para status, se necessário.
            // No frontend, vamos enviar o estado de isAvailable diretamente.
            await updateTable(table.id, { isAvailable: !table.isAvailable });
            await fetchData();
        } catch (err) {
            setError('Erro ao alterar disponibilidade da mesa');
            console.error('Erro ao alterar disponibilidade:', err);
        }
    };

    const getAreaName = (areaId?: string | null) => {
        if (!areaId) {
            return 'Área não encontrada';
        }
        const area = areas.find(area => area.id === areaId);
        return area ? area.name : 'Área não encontrada';
    };

    const getLocationName = (locationId?: string | null) => {
        if (!locationId) {
            return 'Localização não encontrada';
        }
        const location = locations.find(loc => loc.id === locationId);
        return location ? location.name : 'Localização não encontrada';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Mesas</h3>
                    <p className="text-sm text-gray-600">Gerencie layout, status e disponibilidade das mesas do seu estabelecimento</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nova Mesa
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

            {/* Tables List */}
            <div className="bg-white border border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {tables.length === 0 ? (
                        <li className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                            <Square className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">Nenhuma mesa cadastrada</p>
                            <p className="text-sm text-gray-400">Comece adicionando uma nova mesa para o seu layout.</p>
                            <button
                                onClick={handleOpenForm}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Adicionar Mesa
                            </button>
                        </li>
                    ) : (
                        (Array.isArray(tables) ? tables : []).map((table) => (
                            <li key={table.id} className="px-6 py-4 hover:bg-gray-50 transition relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Square className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-semibold text-gray-900">{table.name}</h4>
                                                {/* Ensure status is compatible with TableStatusBadge props */}
                                                <TableStatusBadge status={table.status === 'available' ? 'available' : table.status === 'occupied' ? 'occupied' : table.status === 'reserved' ? 'reserved' : table.status === 'cleaning' ? 'cleaning' : table.status === 'out_of_service' ? 'out_of_service' : table.isAvailable ? 'available' : 'occupied'} />
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {table.isActive ? 'Ativa' : 'Inativa'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    {table.capacity} pessoas
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    {getAreaName(table.areaId)} - {getLocationName(table.locationId)}
                                                </span>
                                            </div>
                                            {table.description && (
                                                <p className="text-sm text-gray-500 mt-2">Obs: {table.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => toggleActiveStatus(table)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg border ${table.isActive
                                                ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                                                : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                                }`}
                                        >
                                            {table.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => toggleAvailableStatus(table)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg border ${table.status === 'available'
                                                ? 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                                : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                                                }`}
                                        >
                                            {table.status === 'available' ? 'Marcar Ocupada' : 'Marcar Disponível'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(table)}
                                            className="text-indigo-600 hover:text-indigo-800 p-1"
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
            {mounted && isFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome da Mesa *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="4"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Localização *
                                    </label>
                                    <select
                                        value={formData.locationId}
                                        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione uma área</option>
                                        {areas.map((area) => (
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Descrição opcional da mesa..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-base text-gray-900">
                                        Mesa ativa
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor="isAvailable" className="ml-2 block text-base text-gray-900">
                                        Mesa disponível
                                    </label>
                                </div>
                            </div>

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
                                    {editingTable ? 'Atualizar' : 'Criar'}
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