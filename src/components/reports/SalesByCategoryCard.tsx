'use client';

import { SalesByCategoryResponse } from "@/lib/api";

interface SalesByCategoryCardProps {
    data: SalesByCategoryResponse[];
}

export function SalesByCategoryCard({ data }: SalesByCategoryCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
            <ul className="space-y-3">
                {data.map((item) => (
                    <li key={item.categoryName} className="flex justify-between items-center">
                        <div>
                            <span className="font-medium text-gray-800">{item.categoryName}</span>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full"
                                    style={{ width: `${(item.totalRevenue / totalRevenue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(item.totalRevenue)}</p>
                            <p className="text-sm text-gray-500">{item.totalQuantitySold} vendidos</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
