'use client';

import { useState, useEffect } from 'react';
import { Download, BarChart3, TrendingUp, Users, ShoppingCart, DollarSign, Calendar, Filter, FileText, PieChart } from 'lucide-react';
import { getOrders, getCustomers, getProducts, getPayments, OrderResponse, CustomerResponse, ProductResponse, PaymentResponse } from '@/lib/api';

interface ReportData {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    topProducts: Array<{ product: ProductResponse; quantity: number; revenue: number }>;
    topCustomers: Array<{ customer: CustomerResponse; orders: number; totalSpent: number }>;
    revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
    revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
}

export function ReportsPanel() {
    const [reportData, setReportData] = useState<ReportData>({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        topProducts: [],
        topCustomers: [],
        revenueByDay: [],
        revenueByCategory: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('30d');
    const [reportType, setReportType] = useState('overview');

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
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

            // Filtrar por período
            const now = new Date();
            const filterDate = new Date();
            switch (dateRange) {
                case '7d':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case '30d':
                    filterDate.setDate(now.getDate() - 30);
                    break;
                case '90d':
                    filterDate.setDate(now.getDate() - 90);
                    break;
                case '1y':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    filterDate.setDate(now.getDate() - 30);
            }

            const filteredOrders = orders.filter(order => new Date(order.createdAt) >= filterDate);
            const filteredPayments = payments.filter(payment =>
                payment.status === 'COMPLETED' && new Date(payment.createdAt) >= filterDate
            );

            // Calcular métricas
            const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalOrders = filteredOrders.length;
            const totalCustomers = customers.length;
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Top produtos (simulado)
            const topProducts = products.slice(0, 5).map(product => ({
                product,
                quantity: Math.floor(Math.random() * 100) + 10,
                revenue: Math.floor(Math.random() * 1000) + 100
            }));

            // Top clientes (simulado)
            const topCustomers = customers.slice(0, 5).map(customer => ({
                customer,
                orders: Math.floor(Math.random() * 20) + 1,
                totalSpent: Math.floor(Math.random() * 500) + 50
            }));

            // Receita por dia (simulado)
            const revenueByDay = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                revenueByDay.unshift({
                    date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
                    revenue: Math.floor(Math.random() * 500) + 100,
                    orders: Math.floor(Math.random() * 20) + 5
                });
            }

            // Receita por categoria (simulado)
            const categories = ['Petiscos', 'Bebidas', 'Sobremesas', 'Entradas'];
            const revenueByCategory = categories.map(category => ({
                category,
                revenue: Math.floor(Math.random() * 1000) + 200,
                percentage: 0
            }));

            // Calcular porcentagens
            const totalCategoryRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.revenue, 0);
            revenueByCategory.forEach(cat => {
                cat.percentage = totalCategoryRevenue > 0 ? (cat.revenue / totalCategoryRevenue) * 100 : 0;
            });

            setReportData({
                totalRevenue,
                totalOrders,
                totalCustomers,
                averageOrderValue,
                topProducts,
                topCustomers,
                revenueByDay,
                revenueByCategory
            });

        } catch (err) {
            setError('Erro ao carregar dados dos relatórios');
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

    const generateReport = () => {
        // Simular geração de relatório
        const reportContent = `
      RELATÓRIO DE VENDAS - ${new Date().toLocaleDateString('pt-BR')}
      
      RESUMO EXECUTIVO:
      - Receita Total: ${formatCurrency(reportData.totalRevenue)}
      - Total de Pedidos: ${reportData.totalOrders}
      - Clientes Ativos: ${reportData.totalCustomers}
      - Ticket Médio: ${formatCurrency(reportData.averageOrderValue)}
      
      PRODUTOS MAIS VENDIDOS:
      ${reportData.topProducts.map((item, index) =>
            `${index + 1}. ${item.product.name} - ${item.quantity} unidades - ${formatCurrency(item.revenue)}`
        ).join('\n')}
      
      CLIENTES TOP:
      ${reportData.topCustomers.map((item, index) =>
            `${index + 1}. ${item.customer.name} - ${item.orders} pedidos - ${formatCurrency(item.totalSpent)}`
        ).join('\n')}
    `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                <h3 className="text-lg font-medium text-gray-900">Relatórios e Análises</h3>
                <div className="flex items-center space-x-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="90d">Últimos 90 dias</option>
                        <option value="1y">Último ano</option>
                    </select>
                    <button
                        onClick={generateReport}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Relatório
                    </button>
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

            {/* Report Type Selector */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setReportType('overview')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'overview'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setReportType('sales')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'sales'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Vendas
                </button>
                <button
                    onClick={() => setReportType('customers')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'customers'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Clientes
                </button>
                <button
                    onClick={() => setReportType('products')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'products'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Produtos
                </button>
            </div>

            {/* Overview Report */}
            {reportType === 'overview' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                                    <p className="text-2xl font-semibold text-gray-900">{reportData.totalOrders}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                                    <p className="text-2xl font-semibold text-gray-900">{reportData.totalCustomers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(reportData.averageOrderValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue by Day */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Receita por Dia</h4>
                            <div className="space-y-3">
                                {reportData.revenueByDay.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{day.date}</span>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500">{day.orders} pedidos</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(day.revenue)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Revenue by Category */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Receita por Categoria</h4>
                            <div className="space-y-3">
                                {reportData.revenueByCategory.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{category.category}</span>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500">{category.percentage.toFixed(1)}%</span>
                                            <span className="text-sm font-medium text-gray-900">{formatCurrency(category.revenue)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Report */}
            {reportType === 'sales' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Análise de Vendas</h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700">Período Analisado</h5>
                                    <p className="text-sm text-gray-600">
                                        {dateRange === '7d' ? 'Últimos 7 dias' :
                                            dateRange === '30d' ? 'Últimos 30 dias' :
                                                dateRange === '90d' ? 'Últimos 90 dias' : 'Último ano'}
                                    </p>
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-gray-700">Total de Vendas</h5>
                                    <p className="text-sm text-gray-600">{reportData.totalOrders} pedidos</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Tendência de Vendas</h5>
                                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Gráfico de tendência será implementado aqui</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customers Report */}
            {reportType === 'customers' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Top Clientes</h4>
                        <div className="space-y-3">
                            {reportData.topCustomers.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.customer.name}</p>
                                        <p className="text-xs text-gray-500">{item.customer.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{item.orders} pedidos</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(item.totalSpent)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Report */}
            {reportType === 'products' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Produtos Mais Vendidos</h4>
                        <div className="space-y-3">
                            {reportData.topProducts.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-xs text-gray-500">{item.product.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{item.quantity} unidades</p>
                                        <p className="text-sm text-gray-600">{formatCurrency(item.revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


