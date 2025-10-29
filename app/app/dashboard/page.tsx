'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats, DashboardData } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
        setError(null);
      } catch (e: any) {
        console.error('Failed to fetch dashboard data:', e);
        // Definir dados vazios ao invés de mostrar erro
        setDashboardData({
          kpis: {
            totalRevenue: { label: 'Receita Total', value: 0 },
            totalOrders: { label: 'Total de Pedidos', value: 0 },
            averageOrderValue: { label: 'Ticket Médio', value: 0 },
            totalCustomers: { label: 'Clientes Ativos', value: 0 },
            activeTables: { label: 'Mesas Ocupadas', value: 0 },
            pendingOrders: { label: 'Pedidos Pendentes', value: 0 },
            lowStockProducts: { label: 'Produtos Estoque Baixo', value: 0 },
            topSellingProduct: { label: 'Produto Mais Vendido', value: 'Nenhum' },
          },
          comparison: {
            revenueChange: 0,
            ordersChange: 0,
            customersChange: 0,
          }
        });
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
        <h3 className="font-semibold">Erro</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { kpis, comparison } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/app/pedidos')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Ver Pedidos
          </button>
          <button
            onClick={() => router.push('/app/mesas')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Ver Mesas
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Pedidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.totalOrders.value}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.ordersChange >= 0 ? (
              <span className="text-green-600 font-semibold">
                {formatPercent(comparison.ordersChange)} vs período anterior
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                {formatPercent(comparison.ordersChange)} vs período anterior
              </span>
            )}
          </div>
        </div>

        {/* Receita Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(kpis.totalRevenue.value)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.revenueChange >= 0 ? (
              <span className="text-green-600 font-semibold">
                {formatPercent(comparison.revenueChange)} vs período anterior
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                {formatPercent(comparison.revenueChange)} vs período anterior
              </span>
            )}
          </div>
        </div>

        {/* Total de Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.totalCustomers.value}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.customersChange >= 0 ? (
              <span className="text-green-600 font-semibold">
                {formatPercent(comparison.customersChange)} vs período anterior
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                {formatPercent(comparison.customersChange)} vs período anterior
              </span>
            )}
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(kpis.averageOrderValue.value)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {comparison.averageOrderValueChange >= 0 ? (
              <span className="text-green-600 font-semibold">
                {formatPercent(comparison.averageOrderValueChange)} vs período anterior
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                {formatPercent(comparison.averageOrderValueChange)} vs período anterior
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Pedidos Pendentes</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {kpis.pendingOrders.value}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Mesas Ativas</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {kpis.activeTables.value}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {kpis.lowStockProducts.value}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="p-6">
          {dashboardData.tables.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.tables.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">Pedido #{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhum pedido recente</p>
          )}
        </div>
      </div>
    </div>
  );
}
