'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CashRegisterResponse, closeCashRegister, CashMovementResponse, MovementType, getOrder, CommandOrderResponse } from '@/lib/api';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle, Loader2, CreditCard, User, Clock, Receipt } from 'lucide-react';
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
    const [movementFormType, setMovementFormType] = useState<MovementType.DEPOSIT | MovementType.WITHDRAWAL | MovementType.EXPENSE | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedMovement, setSelectedMovement] = useState<CashMovementResponse | null>(null);
    const [movementOrder, setMovementOrder] = useState<CommandOrderResponse | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

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

    const formatDateTime = (value: string) =>
        new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    const paymentMethodLabels: Record<string, string> = {
        cash: 'Dinheiro',
        pix: 'PIX',
        credit_card: 'Cartão (Crédito)',
        debit_card: 'Cartão (Débito)',
        bank_transfer: 'Transferência',
        digital_wallet: 'Carteira Digital',
        voucher: 'Voucher',
    };

    // Por simplicidade, vamos manter o cálculo atual, mas isso deve ser refatorado no futuro.
    const registerMovements = Array.isArray(movements) && movements.length > 0
        ? movements
        : Array.isArray((cashRegister as any).movements)
            ? ((cashRegister as any).movements as CashMovementResponse[])
            : [];

    const totalInflows = registerMovements
        .filter(m => m.amount > 0 && m.movementType !== 'opening')
        .reduce((sum, m) => sum + Number(m.amount), 0);

    const totalOutflows = registerMovements
        .filter(m => m.amount < 0)
        .reduce((sum, m) => sum + Math.abs(Number(m.amount)), 0);

    const currentBalance = Number(cashRegister.openingBalance) + totalInflows - totalOutflows;

    const SummaryCard = ({ title, value, icon, accent }: { title: string; value: string; icon: JSX.Element; accent?: 'green' | 'red' | 'blue' }) => {
      const colorClasses = {
        green: 'bg-emerald-50 text-emerald-600',
        red: 'bg-rose-50 text-rose-600',
        blue: 'bg-indigo-50 text-indigo-600',
      } as const;

      return (
        <div className="card p-4 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-600 ${accent ? colorClasses[accent] : ''}`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        </div>
      );
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard title="Saldo Inicial" value={formatCurrency(cashRegister.openingBalance)} icon={<DollarSign className="h-5 w-5" />} />
                <SummaryCard title="Total de Entradas" value={formatCurrency(totalInflows)} icon={<ArrowUpCircle className="h-5 w-5" />} accent="green" />
                <SummaryCard title="Total de Saídas" value={formatCurrency(totalOutflows)} icon={<ArrowDownCircle className="h-5 w-5" />} accent="red" />
                <SummaryCard title="Saldo Atual" value={formatCurrency(currentBalance)} icon={<AlertCircle className="h-5 w-5" />} accent="blue" />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setMovementFormType(MovementType.DEPOSIT)} className="btn-primary flex items-center gap-2 px-4 py-2">
                      Suprimento
                    </button>
                    <button onClick={() => setMovementFormType(MovementType.WITHDRAWAL)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition">
                      Sangria
                    </button>
                    <button onClick={() => setMovementFormType(MovementType.EXPENSE)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 transition">
                      Despesa
                    </button>
                </div>
                <button
                    onClick={() => setIsCloseModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Fechar Caixa
                </button>
            </div>

            <div className="mt-6">
                <MovementsList movements={registerMovements} onViewDetails={async (movement) => {
                    setSelectedMovement(movement);
                    setMovementOrder(null);
                    setDetailsError(null);
                    if (movement.orderId) {
                        setIsDetailsLoading(true);
                        try {
                            const orderData = await getOrder(movement.orderId);
                            setMovementOrder(orderData);
                        } catch (err) {
                            console.error('Erro ao carregar detalhes da movimentação:', err);
                            setDetailsError('Não foi possível carregar os itens desta movimentação.');
                        } finally {
                            setIsDetailsLoading(false);
                        }
                    }
                }} />
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

            {selectedMovement && (
                <MovementDetailsModal
                    movement={selectedMovement}
                    order={movementOrder}
                    paymentLabel={selectedMovement.paymentMethod ? (paymentMethodLabels[selectedMovement.paymentMethod] || selectedMovement.paymentMethod.toUpperCase()) : undefined}
                    onClose={() => {
                        setSelectedMovement(null);
                        setMovementOrder(null);
                        setIsDetailsLoading(false);
                        setDetailsError(null);
                    }}
                    isLoading={isDetailsLoading}
                    error={detailsError}
                    formatCurrency={formatCurrency}
                    formatDateTime={formatDateTime}
                />
            )}
        </div>
    );
}

interface MovementDetailsModalProps {
    movement: CashMovementResponse;
    order: CommandOrderResponse | null;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    paymentLabel?: string;
    formatCurrency: (value: number) => string;
    formatDateTime: (value: string) => string;
}

function MovementDetailsModal({ movement, order, onClose, isLoading, error, paymentLabel, formatCurrency, formatDateTime }: MovementDetailsModalProps) {
    const movementTypeLabels: Record<MovementType, string> = {
        [MovementType.OPENING]: 'Abertura de Caixa',
        [MovementType.CLOSING]: 'Fechamento de Caixa',
        [MovementType.SALE]: 'Venda',
        [MovementType.REFUND]: 'Estorno',
        [MovementType.WITHDRAWAL]: 'Sangria',
        [MovementType.DEPOSIT]: 'Suprimento',
        [MovementType.EXPENSE]: 'Despesa',
        [MovementType.ADJUSTMENT]: 'Ajuste',
    };

    const metadata = movement.metadata || {};
    const tableId = metadata?.tableId ?? metadata?.customFields?.tableId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Detalhes da movimentação</h3>
                        <p className="text-sm text-gray-500">{movementTypeLabels[movement.movementType] || 'Movimentação'} • {formatDateTime(movement.createdAt)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Valor</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(movement.amount)}</p>
                            </div>
                        </div>
                        <div className="card p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Forma de pagamento</p>
                                <p className="text-lg font-semibold text-gray-900">{paymentLabel ?? 'Não informado'}</p>
                            </div>
                        </div>
                        <div className="card p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100 text-gray-600">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">Registrado por</p>
                                <p className="text-lg font-semibold text-gray-900">{movement.user?.name || 'Sistema'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="card p-4 space-y-2">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Saldo anterior</p>
                            <p className="text-lg font-medium text-gray-900">{movement.previousBalance !== undefined ? formatCurrency(movement.previousBalance) : '—'}</p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Saldo atualizado</p>
                            <p className="text-lg font-medium text-gray-900">{movement.newBalance !== undefined ? formatCurrency(movement.newBalance) : '—'}</p>
                        </div>
                        <div className="card p-4 space-y-2">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Observações</p>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{movement.notes || '—'}</p>
                            {(tableId || order?.table?.number) && (
                                <p className="text-sm text-gray-500">
                                    Mesa vinculada: <span className="font-medium text-gray-700">{order?.table?.number || tableId}</span>
                                </p>
                            )}
                            {movement.orderId && (
                                <p className="text-sm text-gray-500">Pedido: <span className="font-medium text-gray-700">{movement.orderId.slice(0, 8)}</span></p>
                            )}
                        </div>
                    </div>

                    {movement.description && (
                        <div className="card p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Descrição</p>
                            <p className="text-sm text-gray-700">{movement.description}</p>
                        </div>
                    )}

                    <div className="card p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-indigo-500" />
                            <h4 className="text-base font-semibold text-gray-900">Itens da movimentação</h4>
                        </div>
                        {isLoading && (
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Carregando itens...
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        {!isLoading && !error && order && order.orderItems.length > 0 ? (
                            <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.productName}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(Number(item.unitPrice ?? 0))}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(item.totalPrice ?? Number(item.unitPrice ?? 0) * item.quantity))}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (!isLoading && !error && (
                            <p className="text-sm text-gray-500">Nenhum item disponível para esta movimentação.</p>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                    <button onClick={onClose} className="btn-secondary">Fechar</button>
                </div>
            </div>
        </div>
    );
}
