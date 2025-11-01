'use client';

import { BarChart3, TrendingUp, DollarSign, ShoppingCart, FileText, LayoutDashboard, LineChart } from 'lucide-react';

export function ReportsManagement() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h3>
                    <p className="text-sm text-gray-600">Visualize dados e métricas do negócio para tomadas de decisão</p>
                </div>
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Receita Total</p>
                        <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>+0% vs. mês passado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>+0% vs. mês passado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-green-50 to-green-100 text-green-600">
                        <LineChart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
                        <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
                        <div className="flex items-center text-sm text-red-600 mt-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span>-0% vs. mês passado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Relatórios Gerados</p>
                        <p className="text-2xl font-bold text-gray-900">0</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <TrendingUp className="h-4 w-4 mr-1 opacity-0" /> {/* Placeholder for alignment */}
                            <span>Último: N/A</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs de relatórios */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-100 pb-4">
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition">Visão Geral</button>
                    <button className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition border border-gray-200">Vendas</button>
                    <button className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition border border-gray-200">Clientes</button>
                    <button className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition border border-gray-200">Produtos</button>
                    <button className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition border border-gray-200">Financeiro</button>
                </div>

                <div className="text-center py-16 flex flex-col items-center justify-center space-y-4">
                    <LayoutDashboard className="h-16 w-16 text-gray-300" />
                    <p className="text-xl font-semibold text-gray-700">Nenhum dado de relatório para exibir</p>
                    <p className="text-sm text-gray-500 max-w-md">Os relatórios e gráficos serão gerados automaticamente conforme as operações do seu estabelecimento. Continue registrando vendas e pedidos para ver as análises aqui!</p>
                </div>
            </div>
        </div>
    );
}

