'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Supplier, deleteSupplier } from '@/lib/api';

interface SuppliersTableProps {
    suppliers: Supplier[];
    onEdit: (supplier: Supplier) => void;
    onDelete: () => void;
}

export default function SuppliersTable({ suppliers, onEdit, onDelete }: SuppliersTableProps) {
    const { user } = useAuthStore();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este fornecedor?')) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteSupplier(id);
            onDelete();
        } catch (error) {
            console.error('Erro ao excluir fornecedor:', error);
            alert('Erro ao excluir fornecedor');
        } finally {
            setDeletingId(null);
        }
    };

    const formatPhone = (phone?: string) => {
        if (!phone) return '-';
        return phone;
    };

    const formatCNPJ = (cnpj?: string) => {
        if (!cnpj) return '-';
        return cnpj;
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
            INACTIVE: { label: 'Inativo', className: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (suppliers.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Nenhum fornecedor encontrado</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CNPJ
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
                    {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                    {supplier.email && (
                                        <div className="text-sm text-gray-500">{supplier.email}</div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {supplier.contactName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPhone(supplier.phone)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCNPJ(supplier.cnpj)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(supplier.status)}
                            </td>
                            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEdit(supplier)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            disabled={deletingId === supplier.id}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        >
                                            {deletingId === supplier.id ? 'Excluindo...' : 'Excluir'}
                                        </button>
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

