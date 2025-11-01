'use client';

import { OrderResponse } from '@/lib/api';
import { X } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { Package, Calendar, User, DollarSign, Printer, XCircle } from 'lucide-react';

interface OrderDetailsModalProps {
    order: OrderResponse;
    onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString));

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

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Detalhes do Pedido #{order.id.substring(0, 8)}...</h3>
                            <p className="text-sm text-gray-500">Informações detalhadas sobre o pedido</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Cliente / Mesa</p>
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                {order.tableName || order.table ? (
                                    <>
                                        <Package className="h-4 w-4 text-gray-600" /> Mesa {order.tableName ?? String(order.table?.number ?? '')}
                                    </>
                                ) : order.customer?.name ? (
                                    <>
                                        <User className="h-4 w-4 text-gray-600" /> {order.customer.name}
                                    </>
                                ) : (
                                    <>
                                        <User className="h-4 w-4 text-gray-600" /> Balcão
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Data do Pedido</p>
                            <p className="font-semibold text-gray-900 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-600" /> {formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        {order.notes && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Observações</p>
                                <p className="font-semibold text-gray-900 text-sm italic">"{order.notes}"</p>
                            </div>
                        )}
                    </div>

                    {/* Itens */}
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Itens do Pedido</h3>
                    <div className="space-y-3">
                        {(order.items || []).map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-semibold text-gray-800">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                    {item.notes && <p className="text-xs text-gray-500 italic mt-0.5">Obs: {item.notes}</p>}
                                </div>
                                <p className="font-semibold text-gray-800 sm:ml-4 mt-2 sm:mt-0">{formatCurrency(item.quantity * item.price)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold text-gray-800">Total do Pedido:</span>
                            <span className="font-bold text-indigo-700">{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 rounded-b-2xl -mx-6 -mb-6">
                    <button onClick={onClose} className="btn-secondary">
                        Fechar
                    </button>
                    <button className="btn-primary">
                        <Printer className="h-5 w-5 mr-2" />
                        Imprimir
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
