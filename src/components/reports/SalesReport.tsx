
'use client';

import { useState, useEffect } from 'react';
import { getSalesReport, SalesReportData } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, ShoppingBasket, BarChart } from 'lucide-react';

// Placeholder for a charting library like Recharts
const SalesChartPlaceholder = () => (
    <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Gráfico de Vendas por Dia</p>
    </div>
);

export function SalesReport() {
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default to the last 7 days
  const [dateRange, setDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    }
  });

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSalesReport({
          startDate: new Date(dateRange.startDate).toISOString(),
          endDate: new Date(dateRange.endDate).toISOString(),
      });
      setReportData(data);
    } catch (err) {
      setError('Falha ao carregar o relatório.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // Initial fetch

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="date" name="startDate" id="startDate" value={dateRange.startDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"/>
            </div>
            <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                <input type="date" name="endDate" id="endDate" value={dateRange.endDate} onChange={handleDateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"/>
            </div>
            <button onClick={fetchReport} disabled={isLoading} className="self-end px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                {isLoading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {/* Report Content */}
        {reportData && !isLoading && (
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <StatCard title="Total de Vendas" value={formatCurrency(reportData.totalRevenue)} icon={DollarSign} color="green" />
                    <StatCard title="Total de Pedidos" value={reportData.totalOrders.toString()} icon={ShoppingBasket} color="blue" />
                    <StatCard title="Ticket Médio" value={formatCurrency(reportData.averageTicket)} icon={BarChart} color="orange" />
                </div>

                {/* Chart and Top Items */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Vendas por Dia</h3>
                        <SalesChartPlaceholder />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Top 5 Itens Vendidos</h3>
                        <ul className="space-y-3">
                            {reportData.topSellingItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center">
                                    <span className="text-gray-700">{item.name}</span>
                                    <span className="font-bold text-gray-900">{item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
