'use client';

import { SalesByCategoryResponse } from "@/lib/api";
import { PieChart } from 'lucide-react';

interface SalesByCategoryCardProps {
    data: SalesByCategoryResponse[];
}

export function SalesByCategoryCard({ data }: SalesByCategoryCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Vendas por Categoria</h3>
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                    <PieChart className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Nenhum dado de categoria</p>
                    <p className="text-sm text-center">Nenhum produto foi vendido nas categorias selecionadas.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {data.map((item) => (
                        <li key={item.categoryName} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex-1 mr-4">
                                <span className="font-medium text-gray-800 text-base">{item.categoryName}</span>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-indigo-500 h-2.5 rounded-full"
                                        style={{ width: `${(item.totalRevenue / totalRevenue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-900 text-lg">{formatCurrency(item.totalRevenue)}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{item.totalQuantitySold} vendidos</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
