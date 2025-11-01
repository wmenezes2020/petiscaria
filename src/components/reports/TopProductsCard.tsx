'use client';

import { TopSellingProductResponse } from "@/lib/api";
import { Package } from 'lucide-react';

interface TopProductsCardProps {
    products: TopSellingProductResponse[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Produtos Mais Vendidos</h3>
            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                    <Package className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">Nenhum produto em destaque</p>
                    <p className="text-sm text-center">Os produtos mais vendidos aparecerão aqui após algumas vendas.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {products.map((product, index) => (
                        <li key={product.productId} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <span className="text-indigo-600 font-bold w-7 text-lg mr-2">{index + 1}.</span>
                                <span className="font-medium text-gray-800 text-base">{product.productName}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-gray-900 text-lg">{product.totalQuantitySold} vendidos</p>
                                <p className="text-sm text-gray-600 mt-0.5">{formatCurrency(product.totalRevenue)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
