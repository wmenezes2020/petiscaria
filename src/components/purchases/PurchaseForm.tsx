'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Purchase, PurchaseItem, Supplier, IngredientResponse, createPurchase, updatePurchase, getSuppliers, getIngredients } from '@/lib/api';
import { createPortal } from 'react-dom';
import { X, Truck, Calendar, DollarSign, Package, Calculator, Trash2, Plus, XCircle, Info, Loader2, Save, PlusCircle } from 'lucide-react';

const purchaseItemSchema = z.object({
    ingredientId: z.string().uuid('Selecione um ingrediente'),
    quantity: z.preprocess(
        (val) => parseFloat(z.string().parse(val) || '0'),
        z.number().min(0.01, 'Quantidade deve ser maior que zero')
    ),
    unitCost: z.preprocess(
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
    const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);

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
            items: [{ ingredientId: '', quantity: 0, unitCost: 0, notes: '' }],
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
            setIngredients(ingredientsResponse);
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
        append({ ingredientId: '', quantity: 0, unitCost: 0, notes: '' });
    };

    const removeItem = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const calculateSubtotal = () => {
        const items = watch('items');
        return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
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
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                        {purchase ? 'Editar Compra' : 'Nova Compra'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                    <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="supplierId" className="input-label">
                                    Fornecedor *
                                </label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        {...register('supplierId')}
                                        id="supplierId"
                                        className="input-field pl-10"
                                    >
                                        <option value="">Selecione um fornecedor</option>
                                        {(suppliers || []).map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.supplierId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.supplierId.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="purchaseDate" className="input-label">
                                    Data da Compra *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        {...register('purchaseDate')}
                                        id="purchaseDate"
                                        className="input-field pl-10"
                                    />
                                </div>
                                {errors.purchaseDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.purchaseDate.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="expectedDeliveryDate" className="input-label">
                                    Data de Entrega Esperada
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        {...register('expectedDeliveryDate')}
                                        id="expectedDeliveryDate"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="input-label">
                                Observações
                            </label>
                            <textarea
                                {...register('notes')}
                                id="notes"
                                rows={3}
                                className="input-field"
                                placeholder="Observações sobre a compra"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-5 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Itens da Compra</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium text-sm px-3 py-2 rounded-md transition-colors duration-200"
                                >
                                    <Plus size={16} /> Adicionar Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div>
                                                <label htmlFor={`items.${index}.ingredientId`} className="input-label">
                                                    Ingrediente *
                                                </label>
                                                <div className="relative">
                                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <select
                                                        {...register(`items.${index}.ingredientId`)}
                                                        id={`items.${index}.ingredientId`}
                                                        className="input-field pl-10"
                                                    >
                                                        <option value="">Selecione um ingrediente</option>
                                                        {(ingredients || []).map((ingredient) => (
                                                            <option key={ingredient.id} value={ingredient.id}>
                                                                {ingredient.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {errors.items?.[index]?.ingredientId && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.items[index]?.ingredientId?.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor={`items.${index}.quantity`} className="input-label">
                                                    Quantidade *
                                                </label>
                                                <div className="relative">
                                                    <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`items.${index}.quantity`)}
                                                        id={`items.${index}.quantity`}
                                                        className="input-field pl-10"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.items?.[index]?.quantity && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.items[index]?.quantity?.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor={`items.${index}.unitCost`} className="input-label">
                                                    Preço Unitário *
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`items.${index}.unitCost`)}
                                                        id={`items.${index}.unitCost`}
                                                        className="input-field pl-10"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.items?.[index]?.unitCost && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.items[index]?.unitCost?.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <label htmlFor={`items.${index}.notes`} className="input-label">
                                                        Observações
                                                    </label>
                                                    <input
                                                        type="text"
                                                        {...register(`items.${index}.notes`)}
                                                        id={`items.${index}.notes`}
                                                        className="input-field"
                                                        placeholder="Observações do item"
                                                    />
                                                </div>
                                                {fields.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-2 text-red-500 hover:text-red-700 rounded-md transition-colors duration-200"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.items && typeof errors.items.message === 'string' && (
                                <p className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                    <Info size={18} className="text-red-500" />
                                    {errors.items.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-100 pt-5 mt-5">
                            <div>
                                <label htmlFor="taxAmount" className="input-label">
                                    Valor dos Impostos
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('taxAmount')}
                                        id="taxAmount"
                                        className="input-field pl-10"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between">
                                    <span className="text-base text-gray-700">Subtotal:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base text-gray-700">Impostos:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(watch('taxAmount') || 0)}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-3 mt-3">
                                    <span className="text-xl font-semibold text-gray-900">Total:</span>
                                    <span className="text-xl font-bold text-indigo-700">
                                        {formatCurrency(calculateTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl -mx-6 -mb-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...</>
                            ) : purchase ? (
                                <><Save className="h-5 w-5 mr-2" /> Atualizar</>
                            ) : (
                                <><PlusCircle className="h-5 w-5 mr-2" /> Criar</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
