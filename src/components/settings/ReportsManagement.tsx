'use client';

import { BarChart3, TrendingUp, DollarSign, ShoppingCart, FileText } from 'lucide-react';

export function ReportsManagement() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
                        <p className="text-sm text-gray-500 mt-1">Visualize dados e métricas do negócio</p>
                    </div>
                </div>
            </div>

            {/* Cards de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="h-8 w-8" />
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <p className="text-blue-100 text-sm">Receita Total</p>
                    <p className="text-3xl font-bold">R$ 0,00</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <ShoppingCart className="h-8 w-8" />
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <p className="text-purple-100 text-sm">Pedidos</p>
                    <p className="text-3xl font-bold">0</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <p className="text-green-100 text-sm">Ticket Médio</p>
                    <p className="text-3xl font-bold">R$ 0,00</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <FileText className="h-8 w-8" />
                    </div>
                    <p className="text-orange-100 text-sm">Clientes</p>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>

            {/* Tabs de relatórios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex space-x-4 mb-6">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">Visão Geral</button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Vendas</button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Clientes</button>
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">Produtos</button>
                </div>

                <div className="text-center py-16">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Nenhum relatório disponível</p>
                    <p className="text-sm text-gray-400 mt-2">Os relatórios serão gerados automaticamente</p>
                </div>
            </div>
        </div>
    );
}

