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
    imageUrl: z.string().optional(),
    isAvailable: z.boolean().default(true),
    preparationTime: z.preprocess((val) => val ? parseInt(z.string().parse(val), 10) : undefined, z.number().int().min(0).optional()),
    allergens: z.array(z.string()).optional(),
    nutritionalInfo: z.object({
        calories: z.number().optional(),
        protein: z.number().optional(),
        carbs: z.number().optional(),
        fat: z.number().optional(),
    }).optional(),
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
            categoryId: product?.categoryId || '',
            imageUrl: product?.imageUrl || '',
            isAvailable: product?.isAvailable ?? true,
            preparationTime: product?.preparationTime || 0,
            allergens: product?.allergens || [],
            nutritionalInfo: product?.nutritionalInfo || {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
            },
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
                            <p className="text-gray-500 text-sm">Funcionalidades de estoque serão implementadas em breve.</p>
                        </div>
                    </div>
                    <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700">Tempo de Preparo (minutos)</label>
                                <input type="number" {...register('preparationTime')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Ex: 15" />
                                {errors.preparationTime && <p className="text-red-500 text-xs mt-1">{errors.preparationTime.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                                <input type="url" {...register('imageUrl')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://..." />
                            </div>
                            <div>
                                <label htmlFor="isAvailable" className="flex items-center">
                                    <input {...register('isAvailable')} type="checkbox" className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                    <span className="text-sm font-medium text-gray-700">Disponível para venda</span>
                                </label>
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
