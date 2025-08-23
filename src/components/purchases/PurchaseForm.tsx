'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Purchase, PurchaseItem, Supplier, Ingredient, createPurchase, updatePurchase, getSuppliers, getIngredients } from '@/lib/api';

const purchaseItemSchema = z.object({
    ingredientId: z.string().uuid('Selecione um ingrediente'),
    quantity: z.preprocess(
        (val) => parseFloat(z.string().parse(val) || '0'),
        z.number().min(0.01, 'Quantidade deve ser maior que zero')
    ),
    unitPrice: z.preprocess(
        (val) => parseFloat(z.string().parse(val) || '0'),
        z.number().min(0.01, 'Preço unitário deve ser maior que zero')
    ),
    notes: z.string().optional(),
});

const purchaseSchema = z.object({
    supplierId: z.string().uuid('Selecione um fornecedor'),
    purchaseDate: z.string().min(1, 'Data da compra é obrigatória'),
    expectedDeliveryDate: z.string().optional(),
    items: z.array(purchaseItemSchema).min(1, 'Adicione pelo menos um item'),
    notes: z.string().optional(),
    taxAmount: z.preprocess(
        (val) => parseFloat(z.string().parse(val) || '0'),
        z.number().min(0, 'Valor do imposto deve ser maior ou igual a zero')
    ).optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
    purchase?: Purchase | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PurchaseForm({ purchase, onClose, onSuccess }: PurchaseFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<PurchaseFormData>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: purchase || {
            supplierId: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            expectedDeliveryDate: '',
            items: [{ ingredientId: '', quantity: 0, unitPrice: 0, notes: '' }],
            notes: '',
            taxAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    useEffect(() => {
        fetchData();
        if (purchase) {
            reset(purchase);
        }
    }, [purchase, reset]);

    const fetchData = async () => {
        try {
            const [suppliersResponse, ingredientsResponse] = await Promise.all([
                getSuppliers(),
                getIngredients(),
            ]);
            setSuppliers(suppliersResponse.data);
            setIngredients(ingredientsResponse.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const onSubmit = async (data: PurchaseFormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            if (purchase) {
                await updatePurchase(purchase.id, data);
            } else {
                await createPurchase(data);
            }

            onSuccess();
        } catch (err) {
            setError('Erro ao salvar compra. Tente novamente.');
            console.error('Erro ao salvar compra:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addItem = () => {
        append({ ingredientId: '', quantity: 0, unitPrice: 0, notes: '' });
    };

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const calculateSubtotal = () => {
        const items = watch('items');
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const taxAmount = watch('taxAmount') || 0;
        return subtotal + taxAmount;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {purchase ? 'Editar Compra' : 'Nova Compra'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fornecedor *
                            </label>
                            <select
                                {...register('supplierId')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione um fornecedor</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supplierId && (
                                <p className="text-red-500 text-sm mt-1">{errors.supplierId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data da Compra *
                            </label>
                            <input
                                type="date"
                                {...register('purchaseDate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.purchaseDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.purchaseDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Entrega Esperada
                            </label>
                            <input
                                type="date"
                                {...register('expectedDeliveryDate')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observações sobre a compra"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Itens da Compra</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                            >
                                + Adicionar Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ingrediente *
                                            </label>
                                            <select
                                                {...register(`items.${index}.ingredientId`)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Selecione um ingrediente</option>
                                                {ingredients.map((ingredient) => (
                                                    <option key={ingredient.id} value={ingredient.id}>
                                                        {ingredient.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.items?.[index]?.ingredientId && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.items[index]?.ingredientId?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantidade *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.quantity`)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                            {errors.items?.[index]?.quantity && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.items[index]?.quantity?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Preço Unitário *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`items.${index}.unitPrice`)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                            {errors.items?.[index]?.unitPrice && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.items[index]?.unitPrice?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-end space-x-2">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Observações
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register(`items.${index}.notes`)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Observações do item"
                                                />
                                            </div>
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {errors.items && (
                            <p className="text-red-500 text-sm mt-1">{errors.items.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor dos Impostos
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('taxAmount')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Impostos:</span>
                                <span className="font-medium">{formatCurrency(watch('taxAmount') || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {formatCurrency(calculateTotal())}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : purchase ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
