'use client';

import { useState, useEffect } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { getOrders, updateOrderItemStatus } from '@/lib/api';
import toast from 'react-hot-toast';

interface KdsOrderItem {
    id: string;
    productName: string;
    quantity: number;
    notes?: string;
    status: string;
}

interface KdsOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    type: string;
    status: string;
    createdAt: string;
    items: KdsOrderItem[];
}

export default function KdsPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [orders, setOrders] = useState<KdsOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Atualizar relógio a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Buscar pedidos a cada 10 segundos quando auto-refresh estiver ativo
    useEffect(() => {
        fetchOrders();
        
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchOrders();
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Detectar mudanças no fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await getOrders();
            const ordersList = Array.isArray(data) ? data : [];
            
            // Filtrar apenas pedidos em preparação
            const preparingOrders = ordersList
                .filter(order => order.status === 'PENDING' || order.status === 'PREPARING')
                .map(order => ({
                    id: order.id,
                    orderNumber: order.id.substring(0, 12),
                    customerName: order.customerName || 'Cliente',
                    type: order.channel === 'DELIVERY' ? 'Delivery' : order.channel === 'TAKEOUT' ? 'Balcão' : 'Mesa',
                    status: order.status,
                    createdAt: order.createdAt,
                    items: order.items?.map((item: any) => ({
                        id: item.id,
                        productName: item.productName,
                        quantity: item.quantity,
                        notes: item.notes,
                        status: item.status
                    })) || []
                }));

            setOrders(preparingOrders);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            toast.error('Erro ao carregar pedidos');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, itemId: string, newStatus: 'PREPARING' | 'READY' | 'PAUSED') => {
        try {
            await updateOrderItemStatus(itemId, { status: newStatus });
            
            // Atualizar estado local
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? {
                        ...order,
                        items: order.items.map(item => 
                            item.id === itemId ? { ...item, status: newStatus } : item
                        )
                    }
                    : order
            ));

            // Tocar som de notificação se habilitado
            if (soundEnabled) {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => {
                    // Ignorar erro se o som não puder ser reproduzido
                });
            }

            toast.success('Status atualizado');
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Erro ao atualizar status');
        }
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Erro ao alternar tela cheia:', error);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeColor = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const minutesDiff = (now.getTime() - created.getTime()) / 60000;
        
        if (minutesDiff > 15) return 'text-red-400';
        if (minutesDiff > 10) return 'text-orange-400';
        if (minutesDiff > 5) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className={`${isFullscreen ? 'h-screen' : 'h-screen'} w-full bg-gray-900 text-white relative overflow-hidden`}>
            {/* Header do KDS */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold text-white">Display de Cozinha - KDS</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Conectado</span>
                        </div>
                        {autoRefresh && (
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Auto-refresh</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Data e Hora */}
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{formatTime(currentTime)}</div>
                        <div className="text-sm text-gray-400 capitalize">{formatDate(currentTime)}</div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title={soundEnabled ? 'Desabilitar som' : 'Habilitar som'}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            title={autoRefresh ? 'Desabilitar auto-refresh' : 'Habilitar auto-refresh'}
                        >
                            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                            title={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid de Pedidos */}
            <div className="flex-1 p-6 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-500" />
                            <p className="text-xl text-gray-300">Carregando pedidos...</p>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <p className="text-2xl text-gray-400 mb-4">Nenhum pedido em preparação</p>
                            <p className="text-gray-500">Aguardando novos pedidos...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
                        {orders.map((order) => {
                            const createdDate = new Date(order.createdAt);
                            const timeStr = createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const timeColor = getTimeColor(order.createdAt);

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white text-gray-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-200 border-l-4 border-blue-500"
                                >
                                    {/* Header do Pedido */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-lg font-bold text-gray-800">#{order.orderNumber}</span>
                                            <span className={`text-sm font-semibold ${timeColor}`}>
                                                {timeStr}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">{order.customerName}</div>
                                        <div className="text-sm font-medium text-blue-600">{order.type}</div>
                                    </div>

                                    {/* Itens do Pedido */}
                                    <div className="flex-1 mb-6">
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="text-sm text-gray-800 leading-relaxed">
                                                    {item.quantity} x {item.productName}
                                                    {item.notes && <span className="text-xs text-gray-500 ml-1">({item.notes})</span>}
                                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                        item.status === 'READY' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {item.status === 'READY' ? '✓' : item.status === 'PAUSED' ? '⏸' : '⬜'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                // Atualizar primeiro item como exemplo
                                                if (order.items[0]) {
                                                    handleUpdateStatus(order.id, order.items[0].id, 'READY');
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            ✅ Pronto
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (order.items[0]) {
                                                    handleUpdateStatus(order.id, order.items[0].id, 'PAUSED');
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                                        >
                                            ⏸️ Pausar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Indicador de Tela Cheia */}
            {isFullscreen && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🖥️ Tela Cheia Ativa
                </div>
            )}
        </div>
    );
}
