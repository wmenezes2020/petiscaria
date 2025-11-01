'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, User, Phone, Mail, MapPin, Calendar, Search, XCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, CustomerResponse } from '@/lib/api';
import { createPortal } from 'react-dom';

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterCustomers();
    }, [searchTerm, customers]);

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

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const customersData = await getCustomers();
            setCustomers(Array.isArray(customersData) ? customersData : []);
        } catch (err) {
            setError('Erro ao carregar clientes');
            console.error('Erro ao buscar clientes:', err);
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterCustomers = () => {
        const customersList = Array.isArray(customers) ? customers : [];

        if (!searchTerm.trim()) {
            setFilteredCustomers(customersList);
            return;
        }

        const filtered = customersList.filter(customer =>
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
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) return cpf; // Não formatar se não tiver 11 dígitos
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone; // Não formatar se não tiver 10 ou 11 dígitos
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h3>
                    <p className="text-sm text-gray-600">Mantenha o cadastro dos seus clientes sempre atualizado</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                >
                    <PlusCircle className="h-4 w-4" />
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
                    className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Buscar por nome, email, telefone ou CPF..."
                />
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

            {/* Customers List */}
            <div className="bg-white border border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {filteredCustomers.length === 0 ? (
                        <li className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                            <UserCheck className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">{searchTerm ? 'Nenhum cliente encontrado para esta busca' : 'Nenhum cliente cadastrado'}</p>
                            {!searchTerm && (
                                <p className="text-sm text-gray-400">Adicione seu primeiro cliente para começar a gerenciar.</p>
                            )}
                            <button
                                onClick={handleOpenForm}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Adicionar Cliente
                            </button>
                        </li>
                    ) : (
                        (Array.isArray(filteredCustomers) ? filteredCustomers : []).map((customer) => (
                            <li key={customer.id} className="px-6 py-4 hover:bg-gray-50 transition relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <User className="h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-base font-semibold text-gray-900">{customer.name}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${customer.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {customer.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                                {customer.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        {customer.email}
                                                    </span>
                                                )}
                                                {customer.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        {formatPhone(customer.phone)}
                                                    </span>
                                                )}
                                                {customer.cpf && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        {formatCPF(customer.cpf)}
                                                    </span>
                                                )}
                                                {customer.address && customer.city && customer.state && (
                                                    <span className="flex items-center gap-1 col-span-full md:col-span-1">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        {customer.address}, {customer.city} - {customer.state}
                                                    </span>
                                                )}
                                                {customer.birthDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        Nasc.: {formatDate(customer.birthDate)}
                                                    </span>
                                                )}
                                            </div>
                                            {customer.notes && (
                                                <p className="text-sm text-gray-500 mt-2">Obs: {customer.notes}</p>
                                            )}
                                            {customer.preferences?.allergies && customer.preferences.allergies.length > 0 && (
                                                <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 mt-2 w-fit">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Alergias: {customer.preferences.allergies.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => toggleActiveStatus(customer)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg border ${customer.isActive
                                                    ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                                                    : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                                }`}
                                        >
                                            {customer.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="p-1 text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="p-1 text-red-600 hover:text-red-900"
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
                    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="cliente@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Rua, número, complemento"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="01234-567"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center pt-7">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg"
                                    />
                                    <label htmlFor="isActive" className="ml-2 block text-base text-gray-900">
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Glúten, Lactose, Ovos"
                                />
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
                                    {editingCustomer ? 'Atualizar' : 'Criar'}
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


