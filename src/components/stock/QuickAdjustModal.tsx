'use client';

import { useEffect, useMemo, useState } from 'react';
import { Portal } from '@/components/PortalRoot';
import { IngredientResponse, updateIngredient } from '@/lib/api';
import { Loader2, Package, PlusCircle, MinusCircle, Tag, XCircle } from 'lucide-react';

type QuickAdjustModalProps = {
    ingredients: IngredientResponse[];
    onClose: () => void;
    onSuccess: () => void;
    defaultIngredientId?: string;
};

type AdjustmentType = 'increase' | 'decrease';

export function QuickAdjustModal({ ingredients, onClose, onSuccess, defaultIngredientId }: QuickAdjustModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedIngredientId, setSelectedIngredientId] = useState<string>(defaultIngredientId || '');
    const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('increase');
    const [amount, setAmount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sortedIngredients = useMemo(() => {
        return [...(ingredients || [])].sort((a, b) => a.name.localeCompare(b.name));
    }, [ingredients]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (defaultIngredientId) {
            setSelectedIngredientId(defaultIngredientId);
        }
    }, [defaultIngredientId]);

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

    const formatQuantity = (value: number, unit: string) => {
        const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value || 0);
        return `${formatted} ${unit}`.trim();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedIngredientId) {
            setError('Selecione um insumo para ajustar.');
            return;
        }

        if (amount <= 0) {
            setError('Informe uma quantidade maior que zero.');
            return;
        }

        const ingredient = sortedIngredients.find(item => item.id === selectedIngredientId);
        if (!ingredient) {
            setError('Insumo selecionado não encontrado.');
            return;
        }

        const currentStock = Number(ingredient.currentStock ?? 0);
        const adjustmentValue = Number(amount ?? 0);
        const newStock = adjustmentType === 'increase'
            ? currentStock + adjustmentValue
            : Math.max(0, currentStock - adjustmentValue);

        setIsSubmitting(true);
        setError(null);

        try {
            await updateIngredient(ingredient.id, { currentStock: newStock });
            onSuccess();
        } catch (err: any) {
            console.error('Erro ao ajustar estoque:', err);
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'Erro ao ajustar estoque.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Ajuste Rápido de Estoque</h3>
                                <p className="text-sm text-gray-500">Atualize a quantidade disponível de um insumo em segundos.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                        <p className="mt-1 text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="input-label">Selecione o Insumo</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={selectedIngredientId}
                                        onChange={(e) => setSelectedIngredientId(e.target.value)}
                                        className="input-field pl-10"
                                    >
                                        <option value="">Escolha um insumo</option>
                                        {sortedIngredients.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedIngredientId && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Estoque atual: {formatQuantity(sortedIngredients.find(i => i.id === selectedIngredientId)?.currentStock || 0, sortedIngredients.find(i => i.id === selectedIngredientId)?.unit || '')}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-3">
                                    <input
                                        type="radio"
                                        id="increase"
                                        name="adjustmentType"
                                        value="increase"
                                        checked={adjustmentType === 'increase'}
                                        onChange={() => setAdjustmentType('increase')}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <label htmlFor="increase" className="ml-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <PlusCircle className="h-4 w-4 text-indigo-500" />
                                        Adicionar ao estoque
                                    </label>
                                </div>
                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-3">
                                    <input
                                        type="radio"
                                        id="decrease"
                                        name="adjustmentType"
                                        value="decrease"
                                        checked={adjustmentType === 'decrease'}
                                        onChange={() => setAdjustmentType('decrease')}
                                        className="form-radio h-4 w-4 text-indigo-600"
                                    />
                                    <label htmlFor="decrease" className="ml-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <MinusCircle className="h-4 w-4 text-rose-500" />
                                        Remover do estoque
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Quantidade</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                        placeholder="0.00"
                                    />
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
                                ) : (
                                    'Aplicar Ajuste'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}


