'use client';

import { CashMovementResponse, MovementType } from "@/lib/api";
import { ArrowDown, ArrowUp, DollarSign, FileText } from "lucide-react";

interface MovementsListProps {
    movements: CashMovementResponse[];
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

export function MovementsList({ movements }: MovementsListProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const sortedMovements = [...movements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Últimas Movimentações</h3>
            <div className="space-y-4">
                {sortedMovements.map(movement => {
                    const config = movementConfig[movement.movementType] || { icon: FileText, color: 'text-gray-500', text: 'Movimentação' };
                    const Icon = config.icon;
                    return (
                        <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                                <Icon className={`${config.color} h-6 w-6 mr-3`} />
                                <div>
                                    <p className="font-medium text-gray-800">{movement.description || config.text}</p>
                                    <p className="text-sm text-gray-500">{formatDate(movement.createdAt)} por {movement.user?.name || 'Sistema'}</p>
                                </div>
                            </div>
                            <p className={`font-semibold text-lg ${movement.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {movement.amount > 0 ? `+${formatCurrency(movement.amount)}` : formatCurrency(movement.amount)}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
