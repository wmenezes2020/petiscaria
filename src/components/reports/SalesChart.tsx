'use client';

import { SalesTimelineResponse } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        <div className="bg-white p-6 rounded-lg shadow-sm h-96">
            <h3 className="text-lg font-semibold mb-4">Receita ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="totalRevenue" name="Receita" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
