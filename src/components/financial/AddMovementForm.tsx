'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createCashMovement, CashMovementResponse, MovementType } from '@/lib/api';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, XCircle, Loader2, TrendingUp, TrendingDown, Wallet, ShoppingBag } from 'lucide-react';

const movementSchema = z.object({
    amount: z.preprocess(
        (val) => parseFloat(z.string().parse(val).replace(',', '.')),
        z.number().min(0.01, 'O valor deve ser maior que zero.')
    ),
    description: z.string().min(3, 'A descrição é obrigatória.'),
    notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface AddMovementFormProps {
    movementType: MovementType.DEPOSIT | MovementType.WITHDRAWAL | MovementType.EXPENSE;
    onClose: () => void;
    onMovementAdded: (movement: CashMovementResponse) => void;
}

const typeConfig = {
    [MovementType.DEPOSIT]: { title: 'Adicionar Suprimento', buttonText: 'Adicionar Suprimento', icon: TrendingUp, iconColor: 'text-green-500', bgColor: 'from-green-500 to-emerald-600' },
    [MovementType.WITHDRAWAL]: { title: 'Registrar Sangria', buttonText: 'Registrar Sangria', icon: TrendingDown, iconColor: 'text-red-500', bgColor: 'from-red-500 to-rose-600' },
    [MovementType.EXPENSE]: { title: 'Registrar Despesa', buttonText: 'Registrar Despesa', icon: ShoppingBag, iconColor: 'text-yellow-500', bgColor: 'from-amber-500 to-orange-600' },
};

export function AddMovementForm({ movementType, onClose, onMovementAdded }: AddMovementFormProps) {
    const [apiError, setApiError] = useState<string | null>(null);
    const config = typeConfig[movementType];

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MovementFormData>({
        resolver: zodResolver(movementSchema),
    });

    const handleCreateMovement = async (data: MovementFormData) => {
        try {
            setApiError(null);
            const newMovement = await createCashMovement({ ...data, movementType });
            onMovementAdded(newMovement);
            onClose();
        } catch (err: any) {
            setApiError(err.response?.data?.message || `Ocorreu um erro ao registrar a movimentação.`);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${config.bgColor}`}>
                            <config.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(handleCreateMovement)} className="p-6 space-y-5 flex-1 flex flex-col">
                    <div className="space-y-4 flex-1 overflow-y-auto">
                        <div>
                            <label htmlFor="amount" className="input-label">Valor (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amount')}
                                    id="amount"
                                    className="input-field pl-10"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="input-label">Descrição</label>
                            <input
                                type="text"
                                {...register('description')}
                                id="description"
                                className="input-field"
                                placeholder="Ex: Salário, Aluguel, Venda de produtos..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="notes" className="input-label">Observações (Opcional)</label>
                            <textarea
                                {...register('notes')}
                                id="notes"
                                rows={3}
                                className="input-field"
                                placeholder="Notas adicionais sobre esta movimentação..."
                            />
                        </div>
                    </div>
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
                            {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...</> : config.buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
