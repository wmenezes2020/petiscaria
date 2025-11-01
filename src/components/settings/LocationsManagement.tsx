'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import { getLocations, createLocation, updateLocation, deleteLocation, LocationResponse } from '@/lib/api';
import { createPortal } from 'react-dom';
import { Building2, Home, Mail, Phone, Map, Globe, XCircle } from 'lucide-react';

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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseForm();
            }
        };

        if (isFormOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isFormOpen]);

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
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Localizações</h3>
                    <p className="text-gray-500">Cadastre e gerencie as localizações do estabelecimento</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="btn-primary"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Localização
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Locations List */}
            <div className="card p-0">
                {(Array.isArray(locations) ? locations : []).length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold text-gray-500">Nenhuma localização cadastrada</p>
                        <p className="text-sm text-gray-400 mt-2">Clique em "Nova Localização" para cadastrar sua primeira localização</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {(Array.isArray(locations) ? locations : []).map((location) => (
                            <li key={location.id} className="relative group px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{location.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {location.address}
                                            {location.city && `, ${location.city}`}
                                            {location.state && ` - ${location.state}`}
                                            {location.zipCode && ` ${location.zipCode}`}
                                        </p>
                                        {location.phone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="h-4 w-4 text-gray-400" /> {location.phone}</p>
                                        )}
                                        {location.email && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="h-4 w-4 text-gray-400" /> {location.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleEdit(location)}
                                        className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Editar localização"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.id)}
                                        className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Excluir localização"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingLocation ? 'Editar Localização' : 'Nova Localização'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="input-label">
                                        Nome da Localização *
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="Ex: Filial Centro"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="address" className="input-label">
                                        Endereço *
                                    </label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="Rua Exemplo, 123"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="city" className="input-label">
                                            Cidade *
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="São Paulo"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="input-label">
                                            Estado *
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                id="state"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="SP"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="zipCode" className="input-label">
                                        CEP *
                                    </label>
                                    <div className="relative">
                                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            id="zipCode"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="01234-567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="phone" className="input-label">
                                            Telefone
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="input-label">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="input-field pl-10"
                                                placeholder="contato@exemplo.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl px-6 py-4 -mx-6 -mb-6">
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
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null} {editingLocation ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

