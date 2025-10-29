'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin } from 'lucide-react';
import { getLocations, createLocation, updateLocation, deleteLocation, LocationResponse } from '@/lib/api';

interface LocationFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
}

export function LocationsManagement() {
    const [locations, setLocations] = useState<LocationResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<LocationFormData>({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setIsLoading(true);
            const locationsData = await getLocations();
            setLocations(Array.isArray(locationsData) ? locationsData : []);
        } catch (err) {
            setError('Erro ao carregar localizações');
            console.error('Erro ao buscar localizações:', err);
            setLocations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome da localização é obrigatório');
            return;
        }

        if (!formData.address.trim()) {
            setError('Endereço é obrigatório');
            return;
        }

        try {
            if (editingLocation) {
                await updateLocation(editingLocation.id, formData);
            } else {
                await createLocation(formData);
            }

            await fetchLocations();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar localização');
            console.error('Erro ao salvar localização:', err);
        }
    };

    const handleEdit = (location: LocationResponse) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            address: location.address ? location.address : '',
            city: location.city ? location.city : '',
            state: location.state ? location.state : '',
            zipCode: location.zipCode ? location.zipCode : '',
            phone: location.phone || '',
            email: location.email || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta localização?')) {
            return;
        }

        try {
            await deleteLocation(id);
            await fetchLocations();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir localização');
            console.error('Erro ao excluir localização:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingLocation(null);
        setFormData({ name: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '' });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingLocation(null);
        setFormData({ name: '', address: '', city: '', state: '', zipCode: '', phone: '', email: '' });
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
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Localizações</h3>
                    <p className="text-sm text-gray-500 mt-1">Cadastre e gerencie as localizações do estabelecimento</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Localização
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Locations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {(Array.isArray(locations) ? locations : []).length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Nenhuma localização cadastrada</p>
                        <p className="text-sm text-gray-400 mt-2">Clique em "Nova Localização" para cadastrar</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {(Array.isArray(locations) ? locations : []).map((location) => (
                            <li key={location.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900">{location.name}</h4>
                                            <p className="text-sm text-gray-500">
                                                {location.address}
                                                {location.city && `, ${location.city}`}
                                                {location.state && ` - ${location.state}`}
                                            </p>
                                            {location.phone && (
                                                <p className="text-sm text-gray-500">📞 {location.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(location)}
                                            className="text-blue-600 hover:text-blue-900 p-2"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(location.id)}
                                            className="text-red-600 hover:text-red-900 p-2"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingLocation ? 'Editar Localização' : 'Nova Localização'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {editingLocation ? 'Atualize as informações da localização' : 'Preencha os dados para criar uma nova localização'}
                            </p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nome da Localização *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Ex: Filial Centro"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Endereço *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Rua Exemplo, 123"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cidade *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="São Paulo"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Estado *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="SP"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        CEP *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="01234-567"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="contato@exemplo.com"
                                        />
                                    </div>
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
                                        {editingLocation ? 'Atualizar' : 'Criar'}
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

