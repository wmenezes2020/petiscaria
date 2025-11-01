'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, CreditCard, DollarSign, Clock, User, Receipt, Search, Filter, XCircle } from 'lucide-react';
import { getPayments, createPayment, updatePayment, deletePayment, getOrders, PaymentResponse, OrderResponse } from '@/lib/api';
import { createPortal } from 'react-dom';
import { X, Hash, FileText, CheckCircle } from 'lucide-react';

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
            // Garantir que os dados são arrays
            const normalizedPayments = (Array.isArray(paymentsData) ? paymentsData : []).map((payment) => ({
                ...payment,
                amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : Number(payment.amount ?? 0),
            }));
            const normalizedOrders = (Array.isArray(ordersData) ? ordersData : []).map((order) => ({
                ...order,
                total: typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total ?? 0),
            }));
            setPayments(normalizedPayments);
            setOrders(normalizedOrders);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
            setPayments([]);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterPayments = () => {
        // Garantir que payments é um array
        const paymentsList = Array.isArray(payments) ? payments : [];
        let filtered = paymentsList;

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
        if (!order) return 'Pedido não encontrado';
        const totalNumber = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total ?? 0);
        return `Pedido #${order.id.slice(-8)} - ${formatCurrency(totalNumber)}`;
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
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Gestão de Pagamentos</h3>
                        <p className="text-gray-500">Visualize e gerencie todos os pagamentos de pedidos.</p>
                    </div>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="btn-primary"
                >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Novo Pagamento
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Buscar por ID da transação, pedido ou valor..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field"
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
                    className="input-field"
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
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Payments List */}
            <div className="card p-0">
                <ul className="divide-y divide-gray-100">
                    {filteredPayments.length === 0 ? (
                        <li className="px-6 py-12 text-center text-gray-500">
                            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-semibold text-gray-500">
                                {searchTerm || statusFilter !== 'ALL' || methodFilter !== 'ALL' ? 'Nenhum pagamento encontrado para os filtros aplicados' : 'Nenhum pagamento cadastrado'}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">Clique em "Novo Pagamento" para registrar um pagamento.</p>
                        </li>
                    ) : (
                        (Array.isArray(filteredPayments) ? filteredPayments : []).map((payment) => (
                            <li key={payment.id} className="relative group px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                                        <CreditCard className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="text-lg font-semibold text-gray-900">
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
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-700">{formatCurrency(payment.amount)}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Receipt className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-700">{getOrderInfo(payment.orderId)}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-gray-700">{formatDate(payment.createdAt)}</span>
                                            </span>
                                        </div>
                                        {payment.notes && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{payment.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        onClick={() => handleEdit(payment)}
                                        className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Editar pagamento"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(payment.id)}
                                        className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Excluir pagamento"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Form Modal */}
            {isFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
                            <div>
                                <label htmlFor="orderId" className="input-label">
                                    Pedido *
                                </label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        id="orderId"
                                        value={formData.orderId}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                        className="input-field pl-10"
                                        required
                                    >
                                        <option value="">Selecione um pedido</option>
                                        {(orders || []).map((order) => {
                                            const totalNumber = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total ?? 0);
                                            return (
                                                <option key={order.id} value={order.id}>
                                                    Pedido #{order.id.slice(-8)} - {formatCurrency(totalNumber)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="amount" className="input-label">
                                        Valor *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            id="amount"
                                            step="0.01"
                                            min="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            className="input-field pl-10"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="method" className="input-label">
                                        Método de Pagamento *
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            id="method"
                                            value={formData.method}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                                            className="input-field pl-10"
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
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="status" className="input-label">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            id="status"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="input-field pl-10"
                                        >
                                            <option value="PENDING">Pendente</option>
                                            <option value="COMPLETED">Concluído</option>
                                            <option value="FAILED">Falhou</option>
                                            <option value="REFUNDED">Reembolsado</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="transactionId" className="input-label">
                                        ID da Transação
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            id="transactionId"
                                            value={formData.transactionId}
                                            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                            className="input-field pl-10"
                                            placeholder="ID da transação (opcional)"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="input-label">
                                    Observações
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="input-field pl-10"
                                        placeholder="Observações sobre o pagamento..."
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl">
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
                                    {editingPayment ? 'Atualizar' : 'Criar'}
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


