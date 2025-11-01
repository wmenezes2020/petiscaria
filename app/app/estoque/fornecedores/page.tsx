'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getSuppliers, Supplier } from '@/lib/api';
import SuppliersTable from '@/components/suppliers/SuppliersTable';
import SupplierForm from '@/components/suppliers/SupplierForm';
import { PlusCircle } from 'lucide-react';

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fornecedores</h1>
                    <p className="text-sm text-gray-600">Gerencie seus fornecedores e organize seu estoque</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Adicionar Fornecedor
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
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


