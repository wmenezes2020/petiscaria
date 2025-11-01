'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getPurchases, Purchase } from '@/lib/api';
import PurchasesTable from '@/components/purchases/PurchasesTable';
import PurchaseForm from '@/components/purchases/PurchaseForm';
import { PlusCircle } from 'lucide-react';

export default function ComprasPage() {
    const { user } = useAuthStore();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const response = await getPurchases();
            setPurchases(response.data);
        } catch (error) {
            console.error('Erro ao carregar compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingPurchase(null);
    };

    const handleFormSuccess = () => {
        fetchPurchases();
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Histórico de Compras</h1>
                    <p className="text-sm text-gray-600">Visualize e gerencie todas as compras de insumos do seu estoque</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Nova Compra
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
                <PurchasesTable
                    purchases={purchases}
                    onEdit={handleEdit}
                    onRefresh={fetchPurchases}
                />
            </div>

            {showForm && (
                <PurchaseForm
                    purchase={editingPurchase}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}



