'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock, Package, MapPin, BarChart3, Calendar, Filter } from 'lucide-react';
import { getOrders, getCustomers, getProducts, getPayments, OrderResponse, CustomerResponse, ProductResponse, PaymentResponse } from '@/lib/api';

interface DashboardMetrics {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    ordersToday: number;
    revenueToday: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

export function Dashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        averageOrderValue: 0,
        ordersToday: 0,
        revenueToday: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
    const [topProducts, setTopProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<string>('7d');

    useEffect(() => {
        fetchDashboardData();
    }, [dateFilter]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [ordersData, customersData, productsData, paymentsData] = await Promise.all([
                getOrders(),
                getCustomers(),
                getProducts(),
                getPayments()
            ]);

            const orders = Array.isArray(ordersData) ? ordersData : [];
            const customers = Array.isArray(customersData) ? customersData : [];
            const products = Array.isArray(productsData) ? productsData : productsData.products || [];
            const payments = Array.isArray(paymentsData) ? paymentsData : [];

            // Calcular métricas
            const totalOrders = orders.length;
            const totalRevenue = payments
                .filter(p => p.status === 'COMPLETED')
                .reduce((sum, p) => sum + p.amount, 0);
            const totalCustomers = customers.length;
            const totalProducts = products.length;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Filtrar por período
            const now = new Date();
            const filterDate = new Date();
            switch (dateFilter) {
                case '1d':
                    filterDate.setDate(now.getDate() - 1);
                    break;
                case '7d':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    filterDate.setDate(now.getDate() - 90);
                    break;
                default:
                    filterDate.setDate(now.getDate() - 7);
            }

            const filteredOrders = orders.filter(order => new Date(order.createdAt) >= filterDate);
            const ordersToday = filteredOrders.length;
            const revenueToday = payments
                .filter(p => p.status === 'COMPLETED' && new Date(p.createdAt) >= filterDate)
                .reduce((sum, p) => sum + p.amount, 0);

            const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
            const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
            const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

            setMetrics({
                totalOrders,
                totalRevenue,
                totalCustomers,
                totalProducts,
                averageOrderValue,
                ordersToday,
                revenueToday,
                pendingOrders,
                completedOrders,
                cancelledOrders
            });

            // Pedidos recentes
            const recent = orders
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);
            setRecentOrders(recent);

            // Produtos mais vendidos (simulado)
            const top = products.slice(0, 5);
            setTopProducts(top);

        } catch (err) {
            setError('Erro ao carregar dados do dashboard');
            console.error('Erro ao buscar dados:', err);
        } finally {
            setIsLoading(false);
        }
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
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="1d">Último dia</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                    </select>
                </div>
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

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">{metrics.ordersToday} hoje</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Receita Total</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">{formatCurrency(metrics.revenueToday)} hoje</span>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics.totalCustomers}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+12% este mês</span>
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                            <p className="text-2xl font-semibold text-gray-900">{metrics.totalProducts}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-600">+5% este mês</span>
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Average Order Value */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
                        </div>
                    </div>
                </div>

                {/* Order Status Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Status dos Pedidos</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Pendentes:</span>
                                    <span className="font-medium">{metrics.pendingOrders}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Concluídos:</span>
                                    <span className="font-medium">{metrics.completedOrders}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Cancelados:</span>
                                    <span className="font-medium">{metrics.cancelledOrders}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Ações Rápidas</p>
                            <div className="mt-2 space-y-2">
                                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                    + Novo Pedido
                                </button>
                                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                    + Novo Cliente
                                </button>
                                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-800">
                                    + Novo Produto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Pedidos Recentes</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Ver todos</button>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhum pedido recente</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Pedido #{order.id.slice(-8)}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(order.total)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Produtos em Destaque</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">Ver todos</button>
                    </div>
                    <div className="space-y-3">
                        {topProducts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Nenhum produto disponível</p>
                        ) : (
                            topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                                        <p className="text-xs text-gray-500">
                                            {product.isAvailable ? 'Disponível' : 'Indisponível'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Revenue Chart Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Receita por Período</h3>
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Últimos 7 dias</span>
                    </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Gráfico de receita será implementado aqui</p>
                        <p className="text-sm text-gray-400">Integração com biblioteca de gráficos</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


