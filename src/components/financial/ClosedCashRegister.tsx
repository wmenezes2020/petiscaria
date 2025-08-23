'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { openCashRegister, CashRegisterResponse } from '@/lib/api';
import { Store } from 'lucide-react';

const openSchema = z.object({
    openingBalance: z.preprocess(
        (val) => parseFloat(z.string().parse(val).replace(',', '.')),
        z.number().min(0, 'O valor deve ser positivo.')
    ),
    notes: z.string().optional(),
});

type OpenFormData = z.infer<typeof openSchema>;

interface ClosedCashRegisterProps {
    onCashRegisterOpened: (cashRegister: CashRegisterResponse) => void;
}

export function ClosedCashRegister({ onCashRegisterOpened }: ClosedCashRegisterProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OpenFormData>({
        resolver: zodResolver(openSchema),
    });

    const handleOpenCashRegister = async (data: OpenFormData) => {
        try {
            setApiError(null);
            const newCashRegister = await openCashRegister(data);
            onCashRegisterOpened(newCashRegister);
            setIsModalOpen(false);
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Ocorreu um erro ao abrir o caixa.');
        }
    };

    return (
        <>
            <div className="text-center bg-white p-12 rounded-lg shadow-sm">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Caixa Fechado</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Não há um caixa aberto no momento. Abra um novo caixa para começar a registrar as vendas.
                </p>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                    >
                        Abrir Caixa
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Abrir Novo Caixa</h2>
                            <form onSubmit={handleSubmit(handleOpenCashRegister)}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700">
                                            Valor de Abertura (Fundo de Troco)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('openingBalance')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            placeholder="0,00"
                                        />
                                        {errors.openingBalance && <p className="text-red-500 text-xs mt-1">{errors.openingBalance.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                            Observações (Opcional)
                                        </label>
                                        <textarea
                                            {...register('notes')}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        />
                                    </div>
                                </div>
                                {apiError && <p className="text-red-500 text-sm mt-4">{apiError}</p>}
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                        {isSubmitting ? 'Abrindo...' : 'Abrir Caixa'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
