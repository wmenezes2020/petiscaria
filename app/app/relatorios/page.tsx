'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getSalesSummary, SalesSummaryResponse,
  getTopSellingProducts, TopSellingProductResponse,
  getSalesByCategory, SalesByCategoryResponse,
  getSalesTimeline, SalesTimelineResponse
} from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, ShoppingCart, BarChart2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { TopProductsCard } from '@/components/reports/TopProductsCard';
import { SalesByCategoryCard } from '@/components/reports/SalesByCategoryCard';
import { SalesChart } from '@/components/reports/SalesChart';

export default function RelatoriosPage() {
  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProductResponse[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryResponse[]>([]);
  const [salesTimeline, setSalesTimeline] = useState<SalesTimelineResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Por favor, selecione as datas de início e fim.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const [summaryData, topProductsData, salesByCategoryData, salesTimelineData] = await Promise.all([
        getSalesSummary(params),
        getTopSellingProducts({ ...params, limit: 5 }),
        getSalesByCategory(params),
        getSalesTimeline(params),
      ]);

      setSummary(summaryData);
      setTopProducts(topProductsData);
      setSalesByCategory(salesByCategoryData);
      setSalesTimeline(salesTimelineData);
    } catch (e) {
      console.error('Failed to fetch reports:', e);
      setError('Não foi possível gerar os relatórios.');
      setSummary(null);
      setTopProducts([]);
      setSalesByCategory([]);
      setSalesTimeline([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div>
      {/* Header and Date Picker */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Relatórios Gerenciais</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Selecione o Período</h2>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Data Início</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              className="p-2 border rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Data Fim</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              className="p-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="self-end px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300"
          >
            {isLoading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-100 p-4 rounded-lg mb-6">{error}</div>}

      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Receita Total"
              value={formatCurrency(summary.totalRevenue)}
              icon={<DollarSign size={24} className="text-green-500" />}
            />
            <StatCard
              title="Total de Pedidos"
              value={summary.totalOrders.toString()}
              icon={<ShoppingCart size={24} className="text-blue-500" />}
            />
            <StatCard
              title="Ticket Médio"
              value={formatCurrency(summary.averageOrderValue)}
              icon={<BarChart2 size={24} className="text-purple-500" />}
            />
          </div>

          {salesTimeline.length > 0 && <SalesChart data={salesTimeline} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topProducts.length > 0 && <TopProductsCard products={topProducts} />}
            {salesByCategory.length > 0 && <SalesByCategoryCard data={salesByCategory} />}
          </div>
        </div>
      )}
    </div>
  );
}