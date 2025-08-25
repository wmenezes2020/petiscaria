'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getSuppliers, Supplier } from '@/lib/api';
import SuppliersTable from '@/components/suppliers/SuppliersTable';
import SupplierForm from '@/components/suppliers/SupplierForm';

export default function FornecedoresPage() {
    const { user } = useAuthStore();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await getSuppliers();
            setSuppliers(response.data);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingSupplier(null);
    };

    const handleFormSuccess = () => {
        fetchSuppliers();
        handleFormClose();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Adicionar Fornecedor
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow">
                <SuppliersTable
                    suppliers={suppliers}
                    onEdit={handleEdit}
                    onDelete={fetchSuppliers}
                />
            </div>

            {showForm && (
                <SupplierForm
                    supplier={editingSupplier}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}


