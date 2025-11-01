'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MenuItemResponse, CategoryResponse, createMenuItem, updateMenuItem, getCategories } from '@/lib/api';
import { createPortal } from 'react-dom';
import { X, Tag, DollarSign, Clock, Image, Vegan, Info, XCircle, Loader2, Save, PlusCircle, Edit } from 'lucide-react';

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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            {product ? <Edit className="h-5 w-5 text-white" /> : <PlusCircle className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{product ? 'Editar Produto' : 'Adicionar Produto'}</h3>
                            <p className="text-sm text-gray-500">{product ? 'Atualize as informações do produto' : 'Adicione um novo item ao cardápio'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="border-b border-gray-100 px-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('basic')} className={`${activeTab === 'basic' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}>
                            Informações Básicas
                        </button>
                        <button onClick={() => setActiveTab('details')} className={`${activeTab === 'details' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}>
                            Detalhes Adicionais
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6">
                    <div style={{ display: activeTab === 'basic' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="input-label">Nome do Produto</label>
                                <input type="text" {...register('name')} id="name" className="input-field" placeholder="Ex: Pizza Calabresa" />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="price" className="input-label">Preço de Venda (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="number" step="0.01" {...register('price')} id="price" className="input-field pl-10" placeholder="0.00" />
                                </div>
                                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="categoryId" className="input-label">Categoria</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select {...register('categoryId')} id="categoryId" className="input-field pl-10">
                                        <option value="">Selecione...</option>
                                        {(categories || []).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="input-label">Descrição</label>
                                <textarea {...register('description')} id="description" rows={3} className="input-field" placeholder="Uma breve descrição do produto..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="preparationTime" className="input-label">Tempo de Preparo (minutos)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="number" {...register('preparationTime')} id="preparationTime" className="input-field pl-10" placeholder="Ex: 15" />
                                </div>
                                {errors.preparationTime && <p className="text-red-500 text-sm mt-1">{errors.preparationTime.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="imageUrl" className="input-label">URL da Imagem</label>
                                <div className="relative">
                                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input type="url" {...register('imageUrl')} id="imageUrl" className="input-field pl-10" placeholder="https://exemplo.com/imagem.jpg" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="isAvailable" className="flex items-center cursor-pointer">
                                    <input {...register('isAvailable')} type="checkbox" id="isAvailable" className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Disponível para venda</span>
                                </label>
                            </div>
                            {/* Nutritional Info e Allergens - Placeholder para futura implementação */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600 flex items-start gap-3">
                                <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                                <p>
                                    As funcionalidades para informações nutricionais e alérgenos serão adicionadas em breve para
                                    fornecer detalhes mais ricos sobre os seus produtos.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* <div style={{ display: activeTab === 'stock' ? 'block' : 'none' }}>
                        <div className="space-y-4">
                            <p className="text-gray-500 text-sm">Funcionalidades de estoque serão implementadas em breve.</p>
                        </div>
                    </div> */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mt-5">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                <p className="mt-1 text-sm text-red-700">{apiError}</p>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl px-6 py-4 -mx-6 -mb-6">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...</>
                            ) : (
                                <><Save className="h-5 w-5 mr-2" /> Salvar Produto</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
