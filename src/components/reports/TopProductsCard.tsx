'use client';

import { TopSellingProductResponse } from "@/lib/api";

interface TopProductsCardProps {
    products: TopSellingProductResponse[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
            <ul className="space-y-3">
                {products.map((product, index) => (
                    <li key={product.productId} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-gray-500 font-bold w-6">{index + 1}.</span>
                            <span className="font-medium text-gray-800">{product.productName}</span>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-900">{product.totalQuantitySold} vendidos</p>
                            <p className="text-sm text-gray-500">{formatCurrency(product.totalRevenue)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
