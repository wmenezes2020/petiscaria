'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CashRegisterResponse, closeCashRegister, CashMovementResponse, MovementType } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { AddMovementForm } from './AddMovementForm';
import { MovementsList } from './MovementsList';
import { Pagination } from '../common/Pagination'; // Supondo a localização

const closeSchema = z.object({
    closingBalance: z.preprocess(
        (val) => parseFloat(z.string().parse(val).replace(',', '.')),
        z.number().min(0, 'O valor deve ser positivo.')
    ),
    notes: z.string().optional(),
});

type CloseFormData = z.infer<typeof closeSchema>;

interface OpenCashRegisterProps {
    cashRegister: CashRegisterResponse;
    movements: CashMovementResponse[];
    pagination: { page: number, limit: number, total: number };
    onCashRegisterClosed: () => void;
    onMovementAdded: (movement: CashMovementResponse) => void;
    onPageChange: (newPage: number) => void;
}

export function OpenCashRegister({
    cashRegister,
    movements,
    pagination,
    onCashRegisterClosed,
    onMovementAdded,
    onPageChange
}: OpenCashRegisterProps) {
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [movementFormType, setMovementFormType] = useState<MovementType | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CloseFormData>({
        resolver: zodResolver(closeSchema),
    });

    const handleCloseCashRegister = async (data: CloseFormData) => {
        try {
            setApiError(null);
            await closeCashRegister(data);
            onCashRegisterClosed();
            setIsCloseModalOpen(false);
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Ocorreu um erro ao fechar o caixa.');
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Por simplicidade, vamos manter o cálculo atual, mas isso deve ser refatorado no futuro.
    const totalInflows = cashRegister.movements
        .filter(m => m.amount > 0 && m.movementType !== 'opening')
        .reduce((sum, m) => sum + m.amount, 0);

    const totalOutflows = cashRegister.movements
        .filter(m => m.amount < 0)
        .reduce((sum, m) => sum + Math.abs(m.amount), 0);

    const currentBalance = cashRegister.openingBalance + totalInflows - totalOutflows;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Saldo Inicial" value={formatCurrency(cashRegister.openingBalance)} icon={<DollarSign />} />
                <StatCard title="Total de Entradas" value={formatCurrency(totalInflows)} icon={<ArrowUpCircle />} color="green" />
                <StatCard title="Total de Saídas" value={formatCurrency(totalOutflows)} icon={<ArrowDownCircle />} color="red" />
                <StatCard title="Saldo Atual" value={formatCurrency(currentBalance)} icon={<AlertCircle />} color="blue" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="space-x-2">
                    <button onClick={() => setMovementFormType(MovementType.DEPOSIT)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Suprimento</button>
                    <button onClick={() => setMovementFormType(MovementType.WITHDRAWAL)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Sangria</button>
                    <button onClick={() => setMovementFormType(MovementType.EXPENSE)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Despesa</button>
                </div>
                <button
                    onClick={() => setIsCloseModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Fechar Caixa
                </button>
            </div>

            <div className="mt-6">
                <MovementsList movements={movements} />
                <Pagination
                    page={pagination.page}
                    limit={pagination.limit}
                    total={pagination.total}
                    onPageChange={onPageChange}
                />
            </div>

            {isCloseModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Fechar Caixa</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Confirme o valor final em caixa para realizar o fechamento. O saldo esperado é de <strong>{formatCurrency(currentBalance)}</strong>.
                            </p>
                            <form onSubmit={handleSubmit(handleCloseCashRegister)}>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="closingBalance" className="block text-sm font-medium text-gray-700">
                                            Valor Final Contado (R$)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register('closingBalance')}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                            placeholder="0,00"
                                        />
                                        {errors.closingBalance && <p className="text-red-500 text-xs mt-1">{errors.closingBalance.message}</p>}
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
                                    <button type="button" onClick={() => setIsCloseModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                        {isSubmitting ? 'Fechando...' : 'Confirmar Fechamento'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {movementFormType && (
                <AddMovementForm
                    movementType={movementFormType}
                    onClose={() => setMovementFormType(null)}
                    onMovementAdded={(movement) => {
                        onMovementAdded(movement);
                        setMovementFormType(null);
                    }}
                />
            )}
        </div>
    );
}
