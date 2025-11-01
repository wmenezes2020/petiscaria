'use client';

import { CashMovementResponse, MovementType } from "@/lib/api";
import { ArrowDown, ArrowUp, DollarSign, FileText, Eye } from "lucide-react";

interface MovementsListProps {
    movements: CashMovementResponse[];
    onViewDetails?: (movement: CashMovementResponse) => void;
}

const movementConfig = {
    [MovementType.SALE]: { icon: DollarSign, color: 'text-green-500', text: 'Venda' },
    [MovementType.DEPOSIT]: { icon: ArrowUp, color: 'text-green-500', text: 'Suprimento' },
    [MovementType.OPENING]: { icon: ArrowUp, color: 'text-blue-500', text: 'Abertura' },
    [MovementType.WITHDRAWAL]: { icon: ArrowDown, color: 'text-yellow-500', text: 'Sangria' },
    [MovementType.EXPENSE]: { icon: ArrowDown, color: 'text-red-500', text: 'Despesa' },
    [MovementType.REFUND]: { icon: ArrowDown, color: 'text-red-500', text: 'Estorno' },
    [MovementType.CLOSING]: { icon: FileText, color: 'text-gray-500', text: 'Fechamento' },
    [MovementType.ADJUSTMENT]: { icon: FileText, color: 'text-gray-500', text: 'Ajuste' },
};

const paymentMethodLabels: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit_card: 'Cartão (Crédito)',
    debit_card: 'Cartão (Débito)',
    bank_transfer: 'Transferência',
    digital_wallet: 'Carteira Digital',
    voucher: 'Voucher',
};

export function MovementsList({ movements, onViewDetails }: MovementsListProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const sortedMovements = [...movements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-5">Últimas Movimentações</h3>
            <div className="space-y-4">
                {sortedMovements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        <FileText className="h-12 w-12 mb-4 text-gray-300" />
                        <p className="text-lg font-semibold mb-2">Nenhuma movimentação encontrada</p>
                        <p className="text-sm text-center">Parece que não há registros de movimentações financeiras para exibir.</p>
                    </div>
                ) : (
                    sortedMovements.map(movement => {
                        const config = movementConfig[movement.movementType] || { icon: FileText, color: 'text-gray-500', text: 'Movimentação' };
                        const Icon = config.icon;
                        const paymentLabel = movement.paymentMethod
                            ? paymentMethodLabels[movement.paymentMethod] || movement.paymentMethod.toUpperCase()
                            : null;

                        return (
                            <div key={movement.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full ${config.color.replace('text-', 'bg-')} bg-opacity-10 mr-4`}>
                                        <Icon className={`${config.color} h-5 w-5`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-gray-800 text-base">{movement.description || config.text}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(movement.createdAt)} por <span className="font-medium text-gray-600">{movement.user?.name || 'Sistema'}</span>
                                        </p>
                                        {paymentLabel && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
                                                {paymentLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className={`font-bold text-lg ${movement.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {movement.amount >= 0 ? `+${formatCurrency(movement.amount)}` : formatCurrency(movement.amount)}
                                    </p>
                                    {onViewDetails && (
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails(movement)}
                                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="text-sm font-medium">Detalhes</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
