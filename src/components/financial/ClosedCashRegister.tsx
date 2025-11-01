'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CashRegisterResponse, openCashRegister } from '@/lib/api';
import { Store } from 'lucide-react';
import { createPortal } from 'react-dom';
import { X, DollarSign, XCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    return (
        <>
            <div className="text-center bg-white p-12 rounded-2xl shadow-lg border border-gray-100 max-w-sm mx-auto">
                <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Caixa Fechado</h3>
                <p className="mt-2 text-base text-gray-500">
                    Não há um caixa aberto no momento. Abra um novo caixa para começar a registrar as vendas.
                </p>
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary px-8 py-3 text-lg"
                    >
                        Abrir Caixa
                    </button>
                </div>
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Abrir Novo Caixa</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit(handleOpenCashRegister)} className="p-6 space-y-5 flex-1 flex flex-col">
                            <div className="space-y-4 flex-1 overflow-y-auto">
                                <div>
                                    <label htmlFor="openingBalance" className="input-label">
                                        Valor de Abertura (Fundo de Troco)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('openingBalance')}
                                            id="openingBalance"
                                            className="input-field pl-10"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.openingBalance && <p className="text-red-500 text-sm mt-1">{errors.openingBalance.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="notes" className="input-label">
                                        Observações (Opcional)
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        id="notes"
                                        rows={3}
                                        className="input-field"
                                        placeholder="Notas adicionais sobre a abertura do caixa..."
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
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="btn-secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary">
                                    {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Abrindo...</> : 'Abrir Caixa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
