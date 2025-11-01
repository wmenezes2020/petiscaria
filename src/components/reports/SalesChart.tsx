'use client';

import { SalesTimelineResponse } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface SalesChartProps {
    data: SalesTimelineResponse[];
}

export function SalesChart({ data }: SalesChartProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-96">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Receita ao Longo do Tempo</h3>
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-xl border border-gray-100 p-8">
                    <BarChart3 className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Nenhum dado de receita disponível</p>
                    <p className="text-sm text-center">Não há informações de vendas para o período selecionado.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="85%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="totalRevenue" name="Receita" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
