'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ShoppingCart, Clock, User, Table, MapPin, Search, Filter, XCircle } from 'lucide-react';
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers, getTables, getProducts, OrderResponse, CustomerResponse, TableResponse, ProductResponse, CreateOrderPayload } from '@/lib/api';
import { Portal } from '@/components/PortalRoot';

interface OrderFormData {
    customerId: string;
    tableId: string;
    items: Array<{
        productId: string;
        quantity: number;
        notes?: string;
    }>;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedTime?: number;
    notes?: string;
}

export function OrdersManagement() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [tables, setTables] = useState<TableResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [formData, setFormData] = useState<OrderFormData>({
        customerId: '',
        tableId: '',
        items: [{ productId: '', quantity: 1, notes: '' }],
        status: 'PENDING',
        priority: 'MEDIUM',
        estimatedTime: 30,
        notes: ''
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchTerm, statusFilter, orders]);

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
            const [ordersData, customersData, tablesData, productsData] = await Promise.all([
                getOrders(),
                getCustomers(),
                getTables(),
                getProducts()
            ]);

            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setCustomers(Array.isArray(customersData) ? customersData : []);
            setTables(Array.isArray(tablesData) ? tablesData : []);

            const productsArray = Array.isArray(productsData)
                ? productsData
                : (Array.isArray((productsData as any)?.products) ? (productsData as any).products : []);
            setProducts(productsArray);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
            setOrders([]);
            setCustomers([]);
            setTables([]);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        const ordersList = Array.isArray(orders) ? orders : [];

        let filtered = ordersList;

        if (searchTerm.trim()) {
            filtered = filtered.filter(order =>
                order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.includes(searchTerm)
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            setError('Cliente é obrigatório');
            return;
        }

        if (!formData.tableId) {
            setError('Mesa é obrigatória');
            return;
        }

        if (formData.items.length === 0 || formData.items.some(item => !item.productId)) {
            setError('Adicione pelo menos um produto');
            return;
        }

        try {
            if (editingOrder) {
                await updateOrder(editingOrder.id, formData as any);
            } else {
                const payload: CreateOrderPayload = {
                    channel: formData.tableId ? 'table' : 'counter',
                    numberOfPeople: Math.max(1, formData.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)),
                    tableId: formData.tableId || undefined,
                    customerId: formData.customerId || undefined,
                    notes: formData.notes,
                    discount: 0,
                    orderItems: formData.items.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        const unitPrice = product ? (typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0)) : 0;
                        return {
                            productId: item.productId,
                            productName: product?.name ?? 'Produto',
                            productDescription: product?.description,
                            unitPrice,
                            quantity: item.quantity,
                            notes: item.notes,
                        };
                    }),
                };

                await createOrder(payload);
            }

            await fetchData();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar pedido');
            console.error('Erro ao salvar pedido:', err);
        }
    };

    const handleEdit = (order: OrderResponse) => {
        setEditingOrder(order);
        setFormData({
            customerId: order.customerId,
            tableId: order.tableId,
            items: order.items || [{ productId: '', quantity: 1, notes: '' }],
            status: order.status,
            priority: order.priority,
            estimatedTime: order.estimatedTime,
            notes: order.notes || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este pedido?')) {
            return;
        }

        try {
            await deleteOrder(id);
            await fetchData();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir pedido');
            console.error('Erro ao excluir pedido:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingOrder(null);
        setFormData({
            customerId: '',
            tableId: '',
            items: [{ productId: '', quantity: 1, notes: '' }],
            status: 'PENDING',
            priority: 'MEDIUM',
            estimatedTime: 30,
            notes: ''
        });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingOrder(null);
        setFormData({
            customerId: '',
            tableId: '',
            items: [{ productId: '', quantity: 1, notes: '' }],
            status: 'PENDING',
            priority: 'MEDIUM',
            estimatedTime: 30,
            notes: ''
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productId: '', quantity: 1, notes: '' }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'PREPARING': return 'bg-blue-100 text-blue-700';
            case 'READY': return 'bg-green-100 text-green-700';
            case 'DELIVERED': return 'bg-gray-100 text-gray-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'PREPARING': return 'Preparando';
            case 'READY': return 'Pronto';
            case 'DELIVERED': return 'Entregue';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'HIGH': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'LOW': return 'Baixa';
            case 'MEDIUM': return 'Média';
            case 'HIGH': return 'Alta';
            default: return priority;
        }
    };

    const getCustomerName = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : 'Cliente não encontrado';
    };

    const getTableName = (tableId: string) => {
        const table = tables.find(t => t.id === tableId);
        return table ? table.name : 'Mesa não encontrada';
    };

    const getProductName = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Produto não encontrado';
    };

    const calculateTotal = (items: any[]) => {
        return items.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return total;
            const priceNumber = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0);
            return total + priceNumber * item.quantity;
        }, 0);
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
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h3>
                    <p className="text-sm text-gray-600">Gerencie todos os pedidos dos seus clientes</p>
                </div>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                >
                    <PlusCircle className="h-4 w-4" />
                    Novo Pedido
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="Buscar por cliente, mesa ou ID..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-shrink-0 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                    <option value="ALL">Todos os Status</option>
                    <option value="PENDING">Pendente</option>
                    <option value="PREPARING">Preparando</option>
                    <option value="READY">Pronto</option>
                    <option value="DELIVERED">Entregue</option>
                    <option value="CANCELLED">Cancelado</option>
                </select>
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

            {/* Orders List */}
            <div className="bg-white border border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                <ul className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                        <li className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                            <ShoppingCart className="h-12 w-12 text-gray-300" />
                            <p className="text-lg font-medium">{searchTerm || statusFilter !== 'ALL' ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}</p>
                            {!searchTerm && statusFilter === 'ALL' && (
                                <p className="text-sm text-gray-400">Comece adicionando um novo pedido para a sua cozinha.</p>
                            )}
                            <button
                                onClick={handleOpenForm}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Adicionar Pedido
                            </button>
                        </li>
                    ) : (
                        filteredOrders.map((order) => (
                            <li key={order.id} className="px-6 py-4 hover:bg-gray-50 transition relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <ShoppingCart className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-base font-semibold text-gray-900">Pedido #{order.id.slice(-8)}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(order.priority)}`}>
                                                    {getPriorityText(order.priority)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    {getCustomerName(order.customerId)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Table className="h-4 w-4 text-gray-400" />
                                                    {getTableName(order.tableId)}
                                                </span>
                                                {order.estimatedTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        {order.estimatedTime} min (Estimado)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-700 mt-2">
                                                <strong className="text-gray-900">Itens:</strong>
                                                <ul className="list-disc list-inside text-gray-600 ml-4">
                                                    {order.items?.map(item => (
                                                        <li key={item.productId} className="py-0.5">
                                                            {getProductName(item.productId)} ({item.quantity}x)
                                                            {item.notes && <span className="text-gray-500 ml-2">- {item.notes}</span>}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {order.notes && (
                                                <p className="text-sm text-gray-500 mt-2">Obs: {order.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => handleEdit(order)}
                                            className="p-1 text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
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
            {mounted && isFormOpen && (
                <Portal>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingOrder ? 'Editar Pedido' : 'Novo Pedido'}
                            </h3>
                            <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cliente *
                                    </label>
                                    <select
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione um cliente</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mesa *
                                    </label>
                                    <select
                                        value={formData.tableId}
                                        onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Selecione uma mesa</option>
                                        {tables.map((table) => (
                                            <option key={table.id} value={table.id}>
                                                {table.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="PREPARING">Preparando</option>
                                        <option value="READY">Pronto</option>
                                        <option value="DELIVERED">Entregue</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridade
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="LOW">Baixa</option>
                                        <option value="MEDIUM">Média</option>
                                        <option value="HIGH">Alta</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tempo Estimado (min)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.estimatedTime}
                                        onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 30 })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Itens do Pedido *
                                </label>
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-3 items-center">
                                            <select
                                                value={item.productId}
                                                onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                className="flex-1 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Selecione um produto</option>
                                                {products.map((product) => {
                                                    const priceNumber = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0);
                                                    return (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceNumber)}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                className="w-full md:w-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Qtd"
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                className="flex-1 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Observações do item"
                                            />
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="flex-shrink-0 p-3 text-red-600 hover:text-red-900 border border-red-200 rounded-xl hover:bg-red-50 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition"
                                    >
                                        <PlusCircle className="h-4 w-4" /> Adicionar Item
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações do Pedido
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Observações gerais sobre o pedido..."
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
                                    {editingOrder ? 'Atualizar Pedido' : 'Criar Pedido'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </Portal>
            )}
        </div>
    );
}


