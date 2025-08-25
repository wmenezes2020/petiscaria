'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Purchase, confirmPurchase, cancelPurchase } from '@/lib/api';

interface PurchasesTableProps {
    purchases: Purchase[];
    onEdit: (purchase: Purchase) => void;
    onRefresh: () => void;
}

export default function PurchasesTable({ purchases, onEdit, onRefresh }: PurchasesTableProps) {
    const { user } = useAuthStore();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleConfirmPurchase = async (id: string) => {
        if (!confirm('Tem certeza que deseja confirmar esta compra?')) {
            return;
        }

        try {
            setUpdatingId(id);
            await confirmPurchase(id);
            onRefresh();
        } catch (error) {
            console.error('Erro ao confirmar compra:', error);
            alert('Erro ao confirmar compra');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancelPurchase = async (id: string) => {
        if (!confirm('Tem certeza que deseja cancelar esta compra?')) {
            return;
        }

        try {
            setUpdatingId(id);
            await cancelPurchase(id);
            onRefresh();
        } catch (error) {
            console.error('Erro ao cancelar compra:', error);
            alert('Erro ao cancelar compra');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
            CONFIRMED: { label: 'Confirmada', className: 'bg-green-100 text-green-800' },
            CANCELLED: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
            RECEIVED: { label: 'Recebida', className: 'bg-blue-100 text-blue-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            className: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (purchases.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma compra encontrada</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fornecedor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {purchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(purchase.purchaseDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {purchase.supplierId || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(purchase.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(purchase.status)}
                            </td>
                            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEdit(purchase)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Editar
                                        </button>
                                        {purchase.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmPurchase(purchase.id)}
                                                    disabled={updatingId === purchase.id}
                                                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                >
                                                    {updatingId === purchase.id ? 'Confirmando...' : 'Confirmar'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelPurchase(purchase.id)}
                                                    disabled={updatingId === purchase.id}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                >
                                                    {updatingId === purchase.id ? 'Cancelando...' : 'Cancelar'}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
