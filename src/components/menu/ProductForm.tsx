'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MenuItemResponse, CategoryResponse, createMenuItem, updateMenuItem, getCategories } from '@/lib/api';

const productSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    description: z.string().optional(),
    price: z.preprocess((val) => parseFloat(z.string().parse(val)), z.number().min(0, 'O preço deve ser positivo.')),
    categoryId: z.string().uuid('Selecione uma categoria válida.'),
    type: z.enum(['food', 'drink', 'dessert', 'side_dish', 'combo']).default('food'),
    status: z.enum(['active', 'inactive', 'out_of_stock', 'discontinued']).default('active'),
    sku: z.string().optional(),
    costPrice: z.preprocess((val) => val ? parseFloat(z.string().parse(val)) : 0, z.number().min(0).optional()),
    stockQuantity: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().int().min(0).default(0)),
    minStockLevel: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().int().min(0).default(0)),
    preparationTime: z.preprocess((val) => parseInt(z.string().parse(val), 10), z.number().int().min(0).optional()),
    isVegetarian: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isSpicy: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    product?: MenuItemResponse | null;
    onClose: () => void;
    onSave: (product: MenuItemResponse) => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'stock' | 'details' | 'images'>('basic');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price || 0,
            categoryId: product?.category.id || '',
            type: product?.type || 'food',
            status: product?.status || 'active',
            sku: product?.sku || '',
            costPrice: product?.costPrice || 0,
            stockQuantity: product?.stockQuantity || 0,
            minStockLevel: product?.minStockLevel || 0,
            preparationTime: product?.preparationTime || 0,
            isVegetarian: product?.isVegetarian || false,
            isVegan: product?.isVegan || false,
            isGlutenFree: product?.isGlutenFree || false,
            isSpicy: product?.isSpicy || false,
        },
    });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        }
        fetchCategories();
    }, []);

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        try {
            setApiError(null);
            let savedProduct: MenuItemResponse;
            if (product) {
                savedProduct = await updateMenuItem(product.id, data);
            } else {
                savedProduct = await createMenuItem(data);
            }
            onSave(savedProduct);
            onClose();
        } catch (err: any) {
            setApiError(err.message || 'Ocorreu um erro ao salvar o produto.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4">{product ? 'Editar Produto' : 'Adicionar Produto'}</h2>

                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('basic')} className={`${activeTab === 'basic' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Informações Básicas
                        </button>
                        <button onClick={() => setActiveTab('stock')} className={`${activeTab === 'stock' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Estoque & Custo
                        </button>
                        <button onClick={() => setActiveTab('details')} className={`${activeTab === 'details' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            Detalhes
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto pr-2">
                    <div style={{ display: activeTab === 'basic' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                                <input type="text" {...register('name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço de Venda (R$)</label>
                                <input type="number" step="0.01" {...register('price')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoria</label>
                                <select {...register('categoryId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">Selecione...</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: activeTab === 'stock' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU (Código)</label>
                                <input type="text" {...register('sku')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">Preço de Custo (R$)</label>
                                <input type="number" step="0.01" {...register('costPrice')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">Qtd. em Estoque</label>
                                    <input type="number" {...register('stockQuantity')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                    {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">Nível Mínimo</label>
                                    <input type="number" {...register('minStockLevel')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                    {errors.minStockLevel && <p className="text-red-500 text-xs mt-1">{errors.minStockLevel.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Produto</label>
                                    <select {...register('type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="food">Comida</option>
                                        <option value="drink">Bebida</option>
                                        <option value="dessert">Sobremesa</option>
                                        <option value="side_dish">Acompanhamento</option>
                                        <option value="combo">Combo</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status de Venda</label>
                                    <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                        <option value="out_of_stock">Fora de Estoque</option>
                                        <option value="discontinued">Descontinuado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">Tempo de Preparo (minutos)</label>
                                <input type="number" {...register('preparationTime')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: 15" />
                                {errors.preparationTime && <p className="text-red-500 text-xs mt-1">{errors.preparationTime.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input {...register('isVegetarian')} id="isVegetarian" type="checkbox" className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="isVegetarian" className="font-medium text-gray-700">Vegetariano</label>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input {...register('isVegan')} id="isVegan" type="checkbox" className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="isVegan" className="font-medium text-gray-700">Vegano</label>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input {...register('isGlutenFree')} id="isGlutenFree" type="checkbox" className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="isGlutenFree" className="font-medium text-gray-700">Sem Glúten</label>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input {...register('isSpicy')} id="isSpicy" type="checkbox" className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="isSpicy" className="font-medium text-gray-700">Picante</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
                    <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
