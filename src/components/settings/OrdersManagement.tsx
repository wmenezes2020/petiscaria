'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ShoppingCart, Clock, User, Table, MapPin, Search, Filter } from 'lucide-react';
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers, getTables, getProducts, OrderResponse, CustomerResponse, TableResponse, ProductResponse } from '@/lib/api';

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

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchTerm, statusFilter, orders]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [ordersData, customersData, tablesData, productsData] = await Promise.all([
                getOrders(),
                getCustomers(),
                getTables(),
                getProducts()
            ]);
            setOrders(ordersData);
            setCustomers(customersData);
            setTables(tablesData);
            setProducts(productsData.products || productsData);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

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
                await updateOrder(editingOrder.id, formData);
            } else {
                await createOrder(formData);
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
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'PREPARING': return 'bg-blue-100 text-blue-800';
            case 'READY': return 'bg-green-100 text-green-800';
            case 'DELIVERED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
            case 'LOW': return 'bg-green-100 text-green-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'HIGH': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Pedidos</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Pedido
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
                        placeholder="Buscar por cliente, mesa ou ID..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erro</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            {searchTerm || statusFilter !== 'ALL' ? 'Nenhum pedido encontrado para os filtros aplicados' : 'Nenhum pedido cadastrado'}
                        </li>
                    ) : (
                        filteredOrders.map((order) => (
                            <li key={order.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-medium text-gray-900">Pedido #{order.id.slice(-8)}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                                    {getPriorityText(order.priority)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    {getCustomerName(order.customerId)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Table className="h-4 w-4 mr-1" />
                                                    {getTableName(order.tableId)}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {order.estimatedTime} min
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <strong>Itens:</strong> {order.items?.map(item =>
                                                    `${getProductName(item.productId)} (${item.quantity}x)`
                                                ).join(', ')}
                                            </div>
                                            {order.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{order.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(order)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
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
                    <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingOrder ? 'Editar Pedido' : 'Novo Pedido'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cliente *
                                        </label>
                                        <select
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                                <div className="grid grid-cols-3 gap-4">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Itens do Pedido *
                                    </label>
                                    <div className="space-y-2">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="flex space-x-2">
                                                <select
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Selecione um produto</option>
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name} - R$ {product.price.toFixed(2)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Qtd"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={item.notes}
                                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Observações"
                                                />
                                                {formData.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="px-3 py-2 text-red-600 hover:text-red-900 border border-red-300 rounded-md hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                        >
                                            + Adicionar Item
                                        </button>
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
                                        placeholder="Observações sobre o pedido..."
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
                                        {editingOrder ? 'Atualizar' : 'Criar'}
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


