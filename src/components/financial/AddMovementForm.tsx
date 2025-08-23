'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createCashMovement, CashMovementResponse, MovementType } from '@/lib/api';
import { useState } from 'react';

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
    [MovementType.DEPOSIT]: { title: 'Adicionar Suprimento', buttonText: 'Adicionar Suprimento' },
    [MovementType.WITHDRAWAL]: { title: 'Registrar Sangria', buttonText: 'Registrar Sangria' },
    [MovementType.EXPENSE]: { title: 'Registrar Despesa', buttonText: 'Registrar Despesa' },
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

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">{config.title}</h2>
                    <form onSubmit={handleSubmit(handleCreateMovement)}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amount')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="0,00"
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                <input
                                    type="text"
                                    {...register('description')}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                />
                            </div>
                        </div>
                        {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
                        <div className="mt-6 flex justify-end space-x-2">
                            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 rounded-lg">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
                                {isSubmitting ? 'Salvando...' : config.buttonText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
