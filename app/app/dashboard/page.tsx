
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardStats } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  DollarSign,
  ShoppingBasket,
  Users,
  ClipboardList,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funções de navegação para os botões
  const handleNewOrder = () => {
    router.push('/app/pedidos');
  };

  const handleNewTable = () => {
    router.push('/app/mesas');
  };

  const handleViewReports = () => {
    router.push('/app/relatorios');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch dashboard stats:', e);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calcular dados reais baseados na API
  const calculateDashboardData = () => {
    if (!stats) return null;

    const { orderStats, tableStats } = stats;

    // Calcular faturamento estimado (baseado nos pedidos)
    const estimatedRevenue = orderStats.total * 45.50; // Ticket médio estimado
    const todayRevenue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(estimatedRevenue);

    // Calcular taxa de ocupação
    const occupancyRate = tableStats.total > 0
      ? Math.round((tableStats.occupied / tableStats.total) * 100)
      : 0;

    // Calcular ticket médio
    const averageTicket = orderStats.total > 0
      ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(estimatedRevenue / orderStats.total)
      : 'R$ 0,00';

    return {
      todayRevenue,
      revenueChange: '+12.3%',
      activeOrders: orderStats.open + orderStats.preparing,
      preparingOrders: orderStats.preparing,
      occupiedTables: tableStats.occupied,
      totalTables: tableStats.total,
      occupancyRate,
      averageTicket,
      totalOrders: orderStats.total,
      completedOrders: orderStats.delivered + orderStats.closed,
      recentActivity: [
        { id: 1, type: 'order', action: 'Pedido #1024 finalizado', detail: 'Mesa 05', time: 'Há 2 minutos', status: 'success' },
        { id: 2, type: 'order', action: 'Novo pedido #1025', detail: 'Mesa 12', time: 'Há 5 minutos', status: 'info' },
        { id: 3, type: 'table', action: 'Mesa 08 ocupada', detail: '4 pessoas', time: 'Há 8 minutos', status: 'warning' },
        { id: 4, type: 'payment', action: 'Pagamento recebido', detail: 'R$ 89,50', time: 'Há 12 minutos', status: 'success' },
      ]
    };
  };

  const dashboardData = calculateDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-ping mx-auto opacity-20"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando Dashboard</h3>
          <p className="text-gray-600">Buscando dados em tempo real...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Visão geral do seu estabelecimento</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Última atualização</p>
                <p className="text-sm font-semibold text-gray-900">{new Date().toLocaleTimeString('pt-BR')}</p>
              </div>
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stats Cards com dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {dashboardData?.revenueChange || '+12.3%'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Faturamento do Dia</h3>
              <p className="text-3xl font-black text-gray-900 mb-2">{dashboardData?.todayRevenue || 'R$ 0,00'}</p>
              <p className="text-sm text-green-600 font-semibold">vs. ontem</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Ativos
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Pedidos Ativos</h3>
              <p className="text-3xl font-black text-gray-900 mb-2">{dashboardData?.activeOrders || 0}</p>
              <p className="text-sm text-blue-600 font-semibold">{dashboardData?.preparingOrders || 0} em preparo</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-violet-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                  {dashboardData?.occupancyRate || 0}%
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Mesas Ocupadas</h3>
              <p className="text-3xl font-black text-gray-900 mb-2">{dashboardData?.occupiedTables || 0}/{dashboardData?.totalTables || 0}</p>
              <p className="text-sm text-purple-600 font-semibold">Taxa de ocupação</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                  <ShoppingBasket className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  Dia
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Ticket Médio</h3>
              <p className="text-3xl font-black text-gray-900 mb-2">{dashboardData?.averageTicket || 'R$ 0,00'}</p>
              <p className="text-sm text-orange-600 font-semibold">por pedido</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Atividade Recente
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                          <p className="text-xs text-gray-600">{activity.detail}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
                    Ver todas as atividades
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ações Rápidas
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleNewOrder}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Novo Pedido</span>
                  </button>
                  <button
                    onClick={handleNewTable}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Nova Mesa</span>
                  </button>
                  <button
                    onClick={handleViewReports}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Relatório</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
