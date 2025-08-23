
import { getDashboardStats } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  DollarSign,
  ShoppingBasket,
  Users,
  ClipboardList,
} from 'lucide-react';

// This is now an async Server Component
export default async function DashboardPage() {
  let stats = null;
  let error = null;

  try {
    // Fetch data directly on the server
    stats = await getDashboardStats();
  } catch (e) {
    console.error('Failed to fetch dashboard stats:', e);
    error = 'Não foi possível carregar os dados do dashboard.';
  }

  // Placeholder for financial data not yet available from the stats endpoints
  const financialStats = {
    dailyRevenue: 'R$ 1.875,50', // TODO: Replace with actual API data
    ticketMedio: 'R$ 156,29', // TODO: Replace with actual API data
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Faturamento do Dia"
          value={financialStats.dailyRevenue}
          icon={DollarSign}
          color="green"
          footer="+5.2% vs ontem"
        />
        <StatCard
          title="Pedidos Ativos"
          value={stats?.orderStats.open || 0}
          icon={ClipboardList}
          color="orange"
          footer={`${stats?.orderStats.preparing || 0} em preparo`}
        />
        <StatCard
          title="Mesas Ocupadas"
          value={`${stats?.tableStats.occupied || 0} / ${stats?.tableStats.total || 0}`}
          icon={Users}
          color="blue"
          footer={`${Math.round(((stats?.tableStats.occupied || 0) / (stats?.tableStats.total || 1)) * 100)}% de ocupação`}
        />
        <StatCard
          title="Ticket Médio"
          value={financialStats.ticketMedio}
          icon={ShoppingBasket}
          color="red"
          footer="Período: Dia"
        />
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Atividade Recente</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {/* This will be replaced with a list of recent orders or actions */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-gray-800">Pedido #1024 <span className="text-green-500 font-semibold">fechado</span> - Mesa 05</p>
            <p className="text-sm text-gray-500">Há 2 minutos</p>
          </div>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-gray-800">Pedido #1023 <span className="text-orange-500 font-semibold">iniciado</span> - Mesa 12</p>
            <p className="text-sm text-gray-500">Há 5 minutos</p>
          </div>
          <div>
            <p className="text-gray-800">Mesa 08 <span className="text-blue-500 font-semibold">ocupada</span></p>
            <p className="text-sm text-gray-500">Há 8 minutos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
