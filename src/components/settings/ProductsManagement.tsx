'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Package, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, ProductResponse, CategoryResponse } from '@/lib/api';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    isAvailable: boolean;
    preparationTime?: number;
    allergens?: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}

export function ProductsManagement() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        imageUrl: '',
        isAvailable: true,
        preparationTime: 0,
        allergens: [],
        nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsData.products || productsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Erro ao carregar dados');
            console.error('Erro ao buscar dados:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Nome do produto é obrigatório');
            return;
        }

        if (!formData.categoryId) {
            setError('Categoria é obrigatória');
            return;
        }

        if (formData.price <= 0) {
            setError('Preço deve ser maior que zero');
            return;
        }

        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                await createProduct(formData);
            }

            await fetchData();
            handleCloseForm();
            setError(null);
        } catch (err) {
            setError('Erro ao salvar produto');
            console.error('Erro ao salvar produto:', err);
        }
    };

    const handleEdit = (product: ProductResponse) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl || '',
            isAvailable: product.isAvailable,
            preparationTime: product.preparationTime || 0,
            allergens: product.allergens || [],
            nutritionalInfo: product.nutritionalInfo || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            }
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) {
            return;
        }

        try {
            await deleteProduct(id);
            await fetchData();
            setError(null);
        } catch (err) {
            setError('Erro ao excluir produto');
            console.error('Erro ao excluir produto:', err);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            categoryId: '',
            imageUrl: '',
            isAvailable: true,
            preparationTime: 0,
            allergens: [],
            nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        });
        setError(null);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            categoryId: '',
            imageUrl: '',
            isAvailable: true,
            preparationTime: 0,
            allergens: [],
            nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        });
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Categoria não encontrada';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
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
                <h3 className="text-lg font-medium text-gray-900">Gestão de Produtos</h3>
                <button
                    onClick={handleOpenForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Produto
                </button>
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

            {/* Products List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">
                            Nenhum produto cadastrado
                        </li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isAvailable
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.isAvailable ? 'Disponível' : 'Indisponível'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{product.description}</p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                                                <span>Categoria: {getCategoryName(product.categoryId)}</span>
                                                <span>Preço: {formatPrice(product.price)}</span>
                                                {product.preparationTime && (
                                                    <span>Preparo: {product.preparationTime}min</span>
                                                )}
                                            </div>
                                            {product.allergens && product.allergens.length > 0 && (
                                                <div className="flex items-center mt-1">
                                                    <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                                                    <span className="text-xs text-yellow-600">
                                                        Alergênicos: {product.allergens.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-900 p-1"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome do Produto *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ex: Hambúrguer Clássico"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Categoria *
                                        </label>
                                        <select
                                            value={formData.categoryId}
                                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Descrição do produto..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preço *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tempo de Preparo (min)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.preparationTime}
                                            onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL da Imagem
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://exemplo.com/imagem.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alergênicos (separados por vírgula)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.allergens?.join(', ') || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            allergens: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Glúten, Lactose, Ovos"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                                        Produto disponível
                                    </label>
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
                                        {editingProduct ? 'Atualizar' : 'Criar'}
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


