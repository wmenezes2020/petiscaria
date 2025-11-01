'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, DashboardData } from '@/lib/api';
import { PlusCircle, Search, Filter, CalendarDays, ChevronDown, RefreshCcw, ShoppingCart, DollarSign, UserCheck, XCircle, Users, Box, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTermOrders, setSearchTermOrders] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]); // Refetch data when date range changes

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      console.log('Dashboard data received:', data);
      setDashboardData(data);
      setError(null);
    } catch (e: any) {
      console.error('Failed to fetch dashboard data:', e);
      setDashboardData({
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          type: 'custom',
        },
        kpis: {
          totalRevenue: { label: 'Receita Total', value: 0 },
          totalOrders: { label: 'Total de Pedidos', value: 0 },
          averageOrderValue: { label: 'Ticket Médio', value: 0 },
          totalCustomers: { label: 'Clientes Ativos', value: 0 },
          activeTables: { label: 'Mesas Ocupadas', value: 0 },
          pendingOrders: { label: 'Pedidos Pendentes', value: 0 },
          lowStockProducts: { label: 'Produtos Estoque Baixo', value: 0 },
          topSellingProduct: { label: 'Produto Mais Vendido', value: 0 },
        },
        comparison: {
          revenueChange: 0,
          ordersChange: 0,
          customersChange: 0,
          averageOrderValueChange: 0,
        },
        tables: {
          recentOrders: [],
          topCustomers: [],
          lowStockAlerts: [],
        },
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div className="flex-1">
            <h3 className="font-semibold text-red-800">Erro:</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null; // ou um empty state mais elaborado
  }

  const { kpis, comparison } = dashboardData;

  const filteredRecentOrders = dashboardData.tables?.recentOrders?.filter(order => {
    const matchesSearchTerm = order.customerName?.toLowerCase().includes(searchTermOrders.toLowerCase()) ||
                              order.orderNumber?.toString().includes(searchTermOrders);

    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDateRange = (!start || orderDate >= start) && (!end || orderDate <= end);

    return matchesSearchTerm && matchesDateRange;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header and Filters */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Visão consolidada das operações do seu estabelecimento</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/app/pedidos')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Criar Pedido
            </button>
            <button
              onClick={() => router.push('/app/relatorios')}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" /> Ver Relatórios
            </button>
          </div>
        </div>

        {/* Search and Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pedidos recentes..."
              value={searchTermOrders}
              onChange={(e) => setSearchTermOrders(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center md:col-span-2 gap-4">
            <label htmlFor="startDate" className="sr-only">Data Início</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
            <span className="text-gray-500">até</span>
            <label htmlFor="endDate" className="sr-only">Data Fim</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
            {/* Future: Add a custom date range picker component */}
            <button className="btn-secondary flex-shrink-0 hidden md:flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Hoje <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Pedidos */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.totalOrders?.value}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.ordersChange !== undefined && comparison.ordersChange !== null ? (
              comparison.ordersChange >= 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> {formatPercent(comparison.ordersChange)} vs período anterior
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" /> {formatPercent(comparison.ordersChange)} vs período anterior
                </span>
              )
            ) : (
              <span className="text-gray-500">N/A vs período anterior</span>
            )}
          </div>
        </div>

        {/* Receita Total */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(kpis.totalRevenue?.value)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.revenueChange !== undefined && comparison.revenueChange !== null ? (
              comparison.revenueChange >= 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> {formatPercent(comparison.revenueChange)} vs período anterior
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" /> {formatPercent(comparison.revenueChange)} vs período anterior
                </span>
              )
            ) : (
              <span className="text-gray-500">N/A vs período anterior</span>
            )}
          </div>
        </div>

        {/* Total de Clientes */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.totalCustomers?.value}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 flex items-center justify-center">
              <UserCheck className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.customersChange !== undefined && comparison.customersChange !== null ? (
              comparison.customersChange >= 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> {formatPercent(comparison.customersChange)} vs período anterior
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" /> {formatPercent(comparison.customersChange)} vs período anterior
                </span>
              )
            ) : (
              <span className="text-gray-500">N/A vs período anterior</span>
            )}
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(kpis.averageOrderValue?.value)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.averageOrderValueChange !== undefined && comparison.averageOrderValueChange !== null ? (
              comparison.averageOrderValueChange >= 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> {formatPercent(comparison.averageOrderValueChange)} vs período anterior
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" /> {formatPercent(comparison.averageOrderValueChange)} vs período anterior
                </span>
              )
            ) : (
              <span className="text-gray-500">N/A vs período anterior</span>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-600">Pedidos Pendentes</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-indigo-500" /> {kpis.pendingOrders?.value}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Mesas Ocupadas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" /> {kpis.activeTables?.value}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            <Box className="h-6 w-6 text-orange-500" /> {kpis.lowStockProducts?.value}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="p-6">
          {filteredRecentOrders && filteredRecentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredRecentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-indigo-500" />
                    <div>
                        <p className="font-semibold text-gray-900">Pedido #{order.orderNumber || order.id?.slice(-8)}</p>
                        <p className="text-sm text-gray-600">Cliente: {order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {order.status === 'PENDING' ? 'Pendente' : 'Concluído'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center justify-center space-y-3 text-gray-500">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-medium text-gray-600">Nenhum pedido recente</p>
                <p className="text-sm text-gray-500 mt-1">Acompanhe aqui os últimos pedidos do seu estabelecimento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
