'use client';

import { OrderResponse } from '@/lib/api';
import { X } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailsModalProps {
    order: OrderResponse;
    onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Detalhes do Pedido #{order.id.substring(0, 8)}...</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Cliente / Mesa</p>
                            <p className="font-semibold">{order.table ? `Mesa ${order.table.number}` : (order.customer?.name || 'Balcão')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Data do Pedido</p>
                            <p className="font-semibold">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    {/* Itens */}
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Itens do Pedido</h3>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                </div>
                                <p className="font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold text-gray-800">Total do Pedido:</span>
                            <span className="font-bold text-orange-600">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Fechar</button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Imprimir</button>
                </div>
            </div>
        </div>
    );
}
