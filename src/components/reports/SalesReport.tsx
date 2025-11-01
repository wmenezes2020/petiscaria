
'use client';

import { useState, useEffect } from 'react';
import { getSalesReport, SalesReportData } from '@/lib/api';
import { DollarSign, ShoppingBasket, BarChart, XCircle, Loader2, Calendar } from 'lucide-react';

// Placeholder for a charting library like Recharts
const SalesChartPlaceholder = () => (
  <div className="w-full h-full bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center p-6">
    <div className="text-center text-gray-500">
      <BarChart className="h-10 w-10 text-blue-400 mx-auto mb-3" />
      <p className="text-sm">Gráfico de vendas será implementado aqui</p>
    </div>
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
  }, [dateRange.startDate, dateRange.endDate]); // Re-fetch when dates change

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-8 rounded-2xl shadow-lg border border-gray-100 bg-white min-h-[300px]">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row items-center p-5 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex-1 relative">
          <label htmlFor="startDate" className="input-label">Data de Início</label>
          <Calendar className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="date" name="startDate" id="startDate" value={dateRange.startDate} onChange={handleDateChange} className="input-field pl-10" />
        </div>
        <div className="flex-1 relative">
          <label htmlFor="endDate" className="input-label">Data de Fim</label>
          <Calendar className="absolute left-3 top-[calc(50%+0.5rem)] transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="date" name="endDate" id="endDate" value={dateRange.endDate} onChange={handleDateChange} className="input-field pl-10" />
        </div>
        <button onClick={fetchReport} disabled={isLoading} className="btn-primary self-end">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null} Gerar Relatório
        </button>
      </div>

      {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
          </div>
      )}

      {/* Report Content */}
      {reportData && !isLoading && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mr-4">
                    <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mr-4">
                    <ShoppingBasket className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders.toString()}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md mr-4">
                    <BarChart className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.averageTicket)}</p>
                </div>
            </div>
          </div>

          {/* Chart and Top Items */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Vendas por Dia</h3>
              <SalesChartPlaceholder />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Top 5 Itens Vendidos</h3>
              <ul className="space-y-4">
                {reportData.topSellingItems.map(item => (
                  <li key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-base font-medium text-gray-800">{item.name}</span>
                    <span className="font-bold text-lg text-gray-900">{item.quantity}</span>
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
