'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { getProducts, updateProduct, ProductResponse } from '@/lib/api';

interface StockMovement {
    id: string;
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    date: Date;
    notes?: string;
}

export function InventoryManagement() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState<string>('ALL');
    const [formData, setFormData] = useState({
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        notes: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, stockFilter, products]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const productsData = await getProducts();
            const productsList = Array.isArray(productsData) ? productsData : productsData.products || [];
            setProducts(productsList);
        } catch (err) {
            setError('Erro ao carregar produtos');
            console.error('Erro ao buscar produtos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (searchTerm.trim()) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtros de estoque serão implementados quando as propriedades estiverem disponíveis
        // Por enquanto, mostra todos os produtos

        setFilteredProducts(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) return;

        try {
            // Atualização de estoque será implementada quando as propriedades estiverem disponíveis
            console.log('Atualização de estoque:', formData);

            await fetchProducts();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao atualizar estoque');
            console.error('Erro ao atualizar estoque:', err);
        }
    };

    const handleEdit = (product: ProductResponse) => {
        setEditingProduct(product);
        setFormData({
            currentStock: 0, // Será implementado quando a propriedade estiver disponível
            minStock: 0, // Será implementado quando a propriedade estiver disponível
            maxStock: 0, // Será implementado quando a propriedade estiver disponível
            notes: ''
        });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        setFormData({
            currentStock: 0,
            minStock: 0,
            maxStock: 0,
            notes: ''
        });
        setError(null);
    };

    const getStockStatus = (product: ProductResponse) => {
        // Propriedades de estoque serão implementadas quando estiverem disponíveis
        const currentStock = 0;
        const minStock = 0;
        const maxStock = 999999;

        if (currentStock === 0) return { status: 'OUT', color: 'bg-red-100 text-red-800', text: 'Sem Estoque' };
        if (currentStock <= minStock) return { status: 'LOW', color: 'bg-yellow-100 text-yellow-800', text: 'Estoque Baixo' };
        if (currentStock >= maxStock) return { status: 'HIGH', color: 'bg-blue-100 text-blue-800', text: 'Estoque Alto' };
        return { status: 'NORMAL', color: 'bg-green-100 text-green-800', text: 'Normal' };
    };

    const getStockTrend = (product: ProductResponse) => {
        // Tendência de estoque será implementada quando as propriedades estiverem disponíveis
        return { trend: 'STABLE', color: 'text-gray-600', icon: Package };
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestão de Estoque</h3>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                        Total de produtos: {products.length}
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar produtos..."
                    />
                </div>
                <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="ALL">Todos os Status</option>
                    <option value="OUT">Sem Estoque</option>
                    <option value="LOW">Estoque Baixo</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Estoque Alto</option>
                </select>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erro</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                0
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                0
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Normal</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {products.filter(p => {
                                    const current = 0; // Será implementado quando a propriedade estiver disponível
                                    // Filtros de estoque serão implementados quando as propriedades estiverem disponíveis
                                    return true;
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-600">Estoque Alto</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                0
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            {searchTerm || stockFilter !== 'ALL' ? 'Nenhum produto encontrado para os filtros aplicados' : 'Nenhum produto cadastrado'}
                        </li>
                    ) : (
                        filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product);
                            const stockTrend = getStockTrend(product);
                            const TrendIcon = stockTrend.icon;

                            return (
                                <li key={product.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center">
                                                        <Package className="h-4 w-4 mr-1" />
                                                        Estoque atual: 0
                                                    </span>
                                                    <span className="flex items-center">
                                                        <AlertTriangle className="h-4 w-4 mr-1" />
                                                        Mínimo: 0
                                                    </span>
                                                    <span className="flex items-center">
                                                        <TrendingUp className="h-4 w-4 mr-1" />
                                                        Máximo: 999999
                                                    </span>
                                                </div>
                                                {product.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`flex items-center ${stockTrend.color}`}>
                                                <TrendIcon className="h-4 w-4 mr-1" />
                                                <span className="text-xs">
                                                    {stockTrend.trend === 'UP' ? 'Subindo' :
                                                        stockTrend.trend === 'DOWN' ? 'Descendo' : 'Estável'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Atualizar Estoque - {editingProduct?.name}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estoque Atual *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.currentStock}
                                            onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estoque Mínimo
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.minStock}
                                            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estoque Máximo
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.maxStock}
                                            onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Observações
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Observações sobre a atualização de estoque..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Atualizar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

