'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, CreditCard, DollarSign, Clock, User, Receipt, Search, Filter } from 'lucide-react';
import { getPayments, createPayment, updatePayment, deletePayment, getOrders, PaymentResponse, OrderResponse } from '@/lib/api';

interface PaymentFormData {
    orderId: string;
    amount: number;
    method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    notes?: string;
}

export function PaymentsManagement() {
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<PaymentResponse[]>([]);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [methodFilter, setMethodFilter] = useState<string>('ALL');
    const [formData, setFormData] = useState<PaymentFormData>({
        orderId: '',
        amount: 0,
        method: 'CASH',
        status: 'PENDING',
        transactionId: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [searchTerm, statusFilter, methodFilter, payments]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [paymentsData, ordersData] = await Promise.all([
                getPayments(),
                getOrders()
            ]);
            setPayments(paymentsData);
            setOrders(ordersData);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPayments = () => {
        let filtered = payments;

        if (searchTerm.trim()) {
            filtered = filtered.filter(payment =>
                payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.orderId.includes(searchTerm) ||
                payment.amount.toString().includes(searchTerm)
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(payment => payment.status === statusFilter);
        }

        if (methodFilter !== 'ALL') {
            filtered = filtered.filter(payment => payment.method === methodFilter);
        }

        setFilteredPayments(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.orderId) {
            setError('Pedido é obrigatório');
            return;
        }

        if (formData.amount <= 0) {
            setError('Valor deve ser maior que zero');
            return;
        }

        try {
            if (editingPayment) {
                await updatePayment(editingPayment.id, formData);
            } else {
                await createPayment(formData);
            }

            await fetchData();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar pagamento');
            console.error('Erro ao salvar pagamento:', err);
        }
    };

    const handleEdit = (payment: PaymentResponse) => {
        setEditingPayment(payment);
        setFormData({
            orderId: payment.orderId,
            amount: payment.amount,
            method: payment.method,
            status: payment.status,
            transactionId: payment.transactionId || '',
            notes: payment.notes || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este pagamento?')) {
            return;
        }

        try {
            await deletePayment(id);
            await fetchData();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir pagamento');
            console.error('Erro ao excluir pagamento:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingPayment(null);
        setFormData({
            orderId: '',
            amount: 0,
            method: 'CASH',
            status: 'PENDING',
            transactionId: '',
            notes: ''
        });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingPayment(null);
        setFormData({
            orderId: '',
            amount: 0,
            method: 'CASH',
            status: 'PENDING',
            transactionId: '',
            notes: ''
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'REFUNDED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'COMPLETED': return 'Concluído';
            case 'FAILED': return 'Falhou';
            case 'REFUNDED': return 'Reembolsado';
            default: return status;
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'CASH': return 'bg-green-100 text-green-800';
            case 'CREDIT_CARD': return 'bg-blue-100 text-blue-800';
            case 'DEBIT_CARD': return 'bg-purple-100 text-purple-800';
            case 'PIX': return 'bg-yellow-100 text-yellow-800';
            case 'TRANSFER': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getMethodText = (method: string) => {
        switch (method) {
            case 'CASH': return 'Dinheiro';
            case 'CREDIT_CARD': return 'Cartão de Crédito';
            case 'DEBIT_CARD': return 'Cartão de Débito';
            case 'PIX': return 'PIX';
            case 'TRANSFER': return 'Transferência';
            default: return method;
        }
    };

    const getOrderInfo = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        return order ? `Pedido #${order.id.slice(-8)} - R$ ${order.total.toFixed(2)}` : 'Pedido não encontrado';
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Pagamentos</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Pagamento
                </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar por ID da transação, pedido ou valor..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="ALL">Todos os Status</option>
                    <option value="PENDING">Pendente</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="FAILED">Falhou</option>
                    <option value="REFUNDED">Reembolsado</option>
                </select>
                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="ALL">Todos os Métodos</option>
                    <option value="CASH">Dinheiro</option>
                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                    <option value="DEBIT_CARD">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="TRANSFER">Transferência</option>
                </select>
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

            {/* Payments List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredPayments.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            {searchTerm || statusFilter !== 'ALL' || methodFilter !== 'ALL' ? 'Nenhum pagamento encontrado para os filtros aplicados' : 'Nenhum pagamento cadastrado'}
                        </li>
                    ) : (
                        filteredPayments.map((payment) => (
                            <li key={payment.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <CreditCard className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {payment.transactionId ? `Transação: ${payment.transactionId}` : `Pagamento #${payment.id.slice(-8)}`}
                                                </h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {getStatusText(payment.status)}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(payment.method)}`}>
                                                    {getMethodText(payment.method)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    <DollarSign className="h-4 w-4 mr-1" />
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Receipt className="h-4 w-4 mr-1" />
                                                    {getOrderInfo(payment.orderId)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {formatDate(payment.createdAt)}
                                                </span>
                                            </div>
                                            {payment.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(payment)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(payment.id)}
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
                                {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pedido *
                                    </label>
                                    <select
                                        value={formData.orderId}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um pedido</option>
                                        {orders.map((order) => (
                                            <option key={order.id} value={order.id}>
                                                Pedido #{order.id.slice(-8)} - R$ {order.total.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Valor *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Método de Pagamento *
                                        </label>
                                        <select
                                            value={formData.method}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="CASH">Dinheiro</option>
                                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                                            <option value="DEBIT_CARD">Cartão de Débito</option>
                                            <option value="PIX">PIX</option>
                                            <option value="TRANSFER">Transferência</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="PENDING">Pendente</option>
                                            <option value="COMPLETED">Concluído</option>
                                            <option value="FAILED">Falhou</option>
                                            <option value="REFUNDED">Reembolsado</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID da Transação
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ID da transação (opcional)"
                                        />
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
                                        placeholder="Observações sobre o pagamento..."
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
                                        {editingPayment ? 'Atualizar' : 'Criar'}
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


