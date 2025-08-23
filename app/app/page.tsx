'use client';

import { useState, useEffect } from 'react';
import {
    ShoppingCartIcon,
    CurrencyDollarIcon,
    UsersIcon,
    ClockIcon,
    CalendarIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Dados mockados para demonstração
const mockData = {
    pedidosHoje: 24,
    faturamentoHoje: 1250.50,
    clientesHoje: 8,
    tempoMedio: 28,
    pedidosHora: [
        { hora: '08:00', pedidos: 2 },
        { hora: '09:00', pedidos: 3 },
        { hora: '10:00', pedidos: 1 },
        { hora: '11:00', pedidos: 4 },
        { hora: '12:00', pedidos: 8 },
        { hora: '13:00', pedidos: 6 },
        { hora: '14:00', pedidos: 3 },
        { hora: '15:00', pedidos: 2 },
        { hora: '16:00', pedidos: 1 },
        { hora: '17:00', pedidos: 3 },
        { hora: '18:00', pedidos: 7 },
        { hora: '19:00', pedidos: 5 },
        { hora: '20:00', pedidos: 4 },
        { hora: '21:00', pedidos: 2 },
    ],
    vendasCategoria: [
        { categoria: 'Petiscos', vendas: 45, cor: '#f27a1a' },
        { categoria: 'Bebidas', vendas: 30, cor: '#22c55e' },
        { categoria: 'Sobremesas', vendas: 15, cor: '#eab308' },
        { categoria: 'Entradas', vendas: 10, cor: '#8b5cf6' },
    ]
};

export default function Dashboard() {
    const [periodo, setPeriodo] = useState('Este mês');
    const [dados, setDados] = useState(mockData);

    const handlePeriodoChange = (novoPeriodo: string) => {
        setPeriodo(novoPeriodo);
        // Aqui implementar lógica para buscar dados do período selecionado
    };

    return (
        <div>
            {/* Header da Página */}
            <div className="flex justify-between items-center pt-3 pb-2 mb-3 border-b border-secondary-200">
                <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-secondary-500" />
                    <select
                        value={periodo}
                        onChange={(e) => handlePeriodoChange(e.target.value)}
                        className="border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="Hoje">Hoje</option>
                        <option value="Semana Passada">Semana Passada</option>
                        <option value="Este mês">Este mês</option>
                        <option value="Mês Passado">Mês Passado</option>
                        <option value="Últimos 3 Meses">Últimos 3 Meses</option>
                        <option value="Último Ano">Último Ano</option>
                    </select>
                </div>
            </div>

            {/* Painel de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Pedidos Hoje */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h5 className="text-sm font-medium text-secondary-500">Pedidos Hoje</h5>
                                <p className="text-2xl font-bold text-secondary-900">{dados.pedidosHoje}</p>
                                <p className="text-sm text-success-600 flex items-center">
                                    <span className="w-2 h-2 bg-success-500 rounded-full mr-1"></span>
                                    +12% em relação a ontem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Faturamento Hoje */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h5 className="text-sm font-medium text-secondary-500">Faturamento Hoje</h5>
                                <p className="text-2xl font-bold text-secondary-900">
                                    R$ {dados.faturamentoHoje.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-sm text-success-600 flex items-center">
                                    <span className="w-2 h-2 bg-success-500 rounded-full mr-1"></span>
                                    +8% em relação a ontem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Novos Clientes */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <UsersIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h5 className="text-sm font-medium text-secondary-500">Novos Clientes</h5>
                                <p className="text-2xl font-bold text-secondary-900">{dados.clientesHoje}</p>
                                <p className="text-sm text-success-600 flex items-center">
                                    <span className="w-2 h-2 bg-success-500 rounded-full mr-1"></span>
                                    +3 em relação a ontem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tempo Médio Entrega */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h5 className="text-sm font-medium text-secondary-500">Tempo Médio Entrega</h5>
                                <p className="text-2xl font-bold text-secondary-900">{dados.tempoMedio} min</p>
                                <p className="text-sm text-danger-600 flex items-center">
                                    <span className="w-2 h-2 bg-danger-500 rounded-full mr-1"></span>
                                    +2 min em relação a ontem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Pedidos por Hora */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-secondary-900">Pedidos por Hora</h3>
                    </div>
                    <div className="card-body">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dados.pedidosHora}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="hora"
                                        stroke="#64748b"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="pedidos"
                                        stroke="#f27a1a"
                                        strokeWidth={3}
                                        dot={{ fill: '#f27a1a', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#f27a1a', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Vendas por Categoria */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-secondary-900">Vendas por Categoria</h3>
                    </div>
                    <div className="card-body">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dados.vendasCategoria}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="categoria"
                                        stroke="#64748b"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="vendas"
                                        fill="#f27a1a"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards de Ação Rápida */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Ações Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card hover:shadow-medium transition-shadow cursor-pointer">
                        <div className="card-body text-center">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <h4 className="font-medium text-secondary-900">Novo Pedido</h4>
                            <p className="text-sm text-secondary-500">Criar pedido rapidamente</p>
                        </div>
                    </div>

                    <div className="card hover:shadow-medium transition-shadow cursor-pointer">
                        <div className="card-body text-center">
                            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <BookOpenIcon className="w-6 h-6 text-success-600" />
                            </div>
                            <h4 className="font-medium text-secondary-900">Gerenciar Cardápio</h4>
                            <p className="text-sm text-secondary-500">Adicionar ou editar itens</p>
                        </div>
                    </div>

                    <div className="card hover:shadow-medium transition-shadow cursor-pointer">
                        <div className="card-body text-center">
                            <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                <UsersIcon className="w-6 h-6 text-info-600" />
                            </div>
                            <h4 className="font-medium text-secondary-900">Ver Clientes</h4>
                            <p className="text-sm text-secondary-500">Gerenciar base de clientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

