'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getPurchases, Purchase } from '@/lib/api';
import PurchasesTable from '@/src/components/purchases/PurchasesTable';
import PurchaseForm from '@/src/components/purchases/PurchaseForm';

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Compras</h1>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Compra
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow">
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



