'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Purchase, confirmPurchase, cancelPurchase } from '@/lib/api';
import { Package, Edit, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
            PENDING: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20' },
            CONFIRMED: { label: 'Confirmada', className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' },
            CANCELLED: { label: 'Cancelada', className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' },
            RECEIVED: { label: 'Recebida', className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            className: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
        };

        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-md ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (purchases.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center justify-center mt-8">
                <Package className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-700 mb-2">Nenhuma compra registrada</p>
                <p className="text-sm text-gray-500">Comece a registrar suas compras para controlar seu estoque.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="overflow-x-auto rounded-b-2xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100/50 rounded-t-2xl">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Fornecedor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ações
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {purchases.map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50 transition-colors duration-200 relative group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(purchase.purchaseDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-800">
                                        {purchase.supplier?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                                    {formatCurrency(purchase.total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(purchase.status)}
                                </td>
                                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => onEdit(purchase)}
                                                className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {purchase.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleConfirmPurchase(purchase.id)}
                                                        disabled={updatingId === purchase.id}
                                                        className="btn-ghost text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        {updatingId === purchase.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelPurchase(purchase.id)}
                                                        disabled={updatingId === purchase.id}
                                                        className="btn-ghost text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        {updatingId === purchase.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancelar
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
        </div>
    );
}
