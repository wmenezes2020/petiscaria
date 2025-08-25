'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, User, Phone, Mail, MapPin, Calendar, Star, Search } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, CustomerResponse } from '@/lib/api';

interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    birthDate?: string;
    notes?: string;
    isActive: boolean;
    preferences?: {
        favoriteProducts?: string[];
        dietaryRestrictions?: string[];
        allergies?: string[];
    };
}

export function CustomersManagement() {
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<CustomerResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        birthDate: '',
        notes: '',
        isActive: true,
        preferences: {
            favoriteProducts: [],
            dietaryRestrictions: [],
            allergies: []
        }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [searchTerm, customers]);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const customersData = await getCustomers();
            setCustomers(customersData);
        } catch (err) {
            setError('Erro ao carregar clientes');
            console.error('Erro ao buscar clientes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterCustomers = () => {
        if (!searchTerm.trim()) {
            setFilteredCustomers(customers);
            return;
        }

        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.cpf.includes(searchTerm)
        );
        setFilteredCustomers(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome do cliente é obrigatório');
            return;
        }

        if (!formData.email.trim()) {
            setError('Email é obrigatório');
            return;
        }

        if (!formData.phone.trim()) {
            setError('Telefone é obrigatório');
            return;
        }

        if (!formData.cpf.trim()) {
            setError('CPF é obrigatório');
            return;
        }

        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, formData);
            } else {
                await createCustomer(formData);
            }

            await fetchCustomers();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar cliente');
            console.error('Erro ao salvar cliente:', err);
        }
    };

    const handleEdit = (customer: CustomerResponse) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            cpf: customer.cpf,
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            zipCode: customer.zipCode || '',
            birthDate: customer.birthDate || '',
            notes: customer.notes || '',
            isActive: customer.isActive,
            preferences: customer.preferences || {
                favoriteProducts: [],
                dietaryRestrictions: [],
                allergies: []
            }
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) {
            return;
        }

        try {
            await deleteCustomer(id);
            await fetchCustomers();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir cliente');
            console.error('Erro ao excluir cliente:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            birthDate: '',
            notes: '',
            isActive: true,
            preferences: {
                favoriteProducts: [],
                dietaryRestrictions: [],
                allergies: []
            }
        });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingCustomer(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            birthDate: '',
            notes: '',
            isActive: true,
            preferences: {
                favoriteProducts: [],
                dietaryRestrictions: [],
                allergies: []
            }
        });
    };

    const toggleActiveStatus = async (customer: CustomerResponse) => {
        try {
            await updateCustomer(customer.id, { isActive: !customer.isActive });
            await fetchCustomers();
        } catch (err) {
            setError('Erro ao alterar status do cliente');
            console.error('Erro ao alterar status:', err);
        }
    };

    const formatCPF = (cpf: string) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatPhone = (phone: string) => {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Clientes</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Cliente
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar por nome, email, telefone ou CPF..."
                />
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

            {/* Customers List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredCustomers.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            {searchTerm ? 'Nenhum cliente encontrado para esta busca' : 'Nenhum cliente cadastrado'}
                        </li>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <li key={customer.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h4 className="text-sm font-medium text-gray-900">{customer.name}</h4>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {customer.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    <Mail className="h-4 w-4 mr-1" />
                                                    {customer.email}
                                                </span>
                                                <span className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    {formatPhone(customer.phone)}
                                                </span>
                                                <span className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {formatCPF(customer.cpf)}
                                                </span>
                                            </div>
                                            {customer.address && (
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {customer.address}, {customer.city} - {customer.state} {customer.zipCode}
                                                </div>
                                            )}
                                            {customer.birthDate && (
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Nascimento: {formatDate(customer.birthDate)}
                                                </div>
                                            )}
                                            {customer.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{customer.notes}</p>
                                            )}
                                            {customer.preferences?.allergies && customer.preferences.allergies.length > 0 && (
                                                <div className="flex items-center text-sm text-yellow-600 mt-1">
                                                    <Star className="h-4 w-4 mr-1" />
                                                    Alergias: {customer.preferences.allergies.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => toggleActiveStatus(customer)}
                                            className={`px-3 py-1 text-xs font-medium rounded-md ${customer.isActive
                                                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                }`}
                                        >
                                            {customer.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
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
                    <div className="relative top-10 mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nome completo do cliente"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="cliente@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CPF *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="123.456.789-00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Rua, número, complemento"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="São Paulo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="SP"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="01234-567"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data de Nascimento
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            Cliente ativo
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Observações
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Observações sobre o cliente..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alergias (separadas por vírgula)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.preferences?.allergies?.join(', ') || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            preferences: {
                                                ...formData.preferences,
                                                allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                                            }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Glúten, Lactose, Ovos"
                                    />
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
                                        {editingCustomer ? 'Atualizar' : 'Criar'}
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


