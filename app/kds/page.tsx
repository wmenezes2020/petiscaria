'use client';

import { useState, useEffect } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, RefreshCw, Loader2 } from 'lucide-react';
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
    // Inicializar como null para evitar hydration mismatch
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [orders, setOrders] = useState<KdsOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Atualizar relógio a cada segundo (apenas no cliente)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Inicializar tempo atual apenas no cliente
        setCurrentTime(new Date());
        
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
        // CRITICAL: Only access document on client
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

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
            const statusMap = {
                PREPARING: 'preparing',
                READY: 'ready',
                PAUSED: 'pending',
            } as const;

            await updateOrderItemStatus({
                orderId,
                itemId,
                status: statusMap[newStatus],
            });

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
        <div className={`relative flex flex-col ${isFullscreen ? 'h-screen' : 'h-screen'} w-full bg-gray-900 text-white overflow-hidden`}>
            {/* Header do KDS */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-6">
                    <h1 className="text-3xl font-bold text-white drop-shadow-sm">Display de Cozinha <span className="text-blue-400">KDS</span></h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Conectado</span>
                        </div>
                        {autoRefresh && (
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                <span>Auto-refresh</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Data e Hora */}
                    <div className="text-right">
                        {currentTime ? (
                            <>
                                <div className="text-3xl font-extrabold text-indigo-400">{formatTime(currentTime)}</div>
                                <div className="text-sm text-gray-400 capitalize mt-0.5">{formatDate(currentTime)}</div>
                            </>
                        ) : (
                            <>
                                <div className="text-3xl font-extrabold text-indigo-400">--:--:--</div>
                                <div className="text-sm text-gray-400 capitalize mt-0.5">-- -- ----</div>
                            </>
                        )}
                    </div>

                    {/* Controles */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${soundEnabled ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            title={soundEnabled ? 'Desabilitar som' : 'Habilitar som'}
                        >
                            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${autoRefresh ? 'bg-green-600 text-white shadow-md' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            title={autoRefresh ? 'Desabilitar auto-refresh' : 'Habilitar auto-refresh'}
                        >
                            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-md"
                            title={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid de Pedidos */}
            <div className="flex-1 p-6 overflow-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-indigo-400" />
                            <p className="text-xl text-gray-300 font-medium">Carregando pedidos...</p>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                            <p className="text-2xl text-gray-400 mb-4 font-semibold">Nenhum pedido em preparação</p>
                            <p className="text-gray-500">Aguardando novos pedidos da comanda...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full auto-rows-max">
                        {orders.map((order) => {
                            const createdDate = new Date(order.createdAt);
                            const timeStr = createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const timeColor = getTimeColor(order.createdAt);

                            return (
                                <div
                                    key={order.id}
                                    className="bg-gray-800 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-200 border-l-4 border-blue-500 border-opacity-70"
                                >
                                    {/* Header do Pedido */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xl font-bold text-blue-400">#{order.orderNumber}</span>
                                            <span className={`text-sm font-semibold ${timeColor}`}>
                                                {timeStr}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-300 mb-1">{order.customerName}</div>
                                        <div className="text-sm font-medium text-blue-500 bg-blue-900/20 rounded-lg px-2 py-0.5 inline-block">{order.type}</div>
                                    </div>

                                    {/* Itens do Pedido */}
                                    <div className="flex-1 mb-6 space-y-3">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="text-base text-gray-100 flex items-center justify-between">
                                                <span>
                                                    <span className="font-semibold">{item.quantity}x</span> {item.productName}
                                                    {item.notes && <span className="text-xs text-gray-400 ml-1">({item.notes})</span>}
                                                </span>
                                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === 'READY' ? 'bg-green-600 text-white' :
                                                        item.status === 'PAUSED' ? 'bg-yellow-600 text-white' :
                                                            'bg-blue-600 text-white'
                                                    }`}>
                                                    {item.status === 'READY' ? 'Pronto' : item.status === 'PAUSED' ? 'Pausado' : 'Em Preparo'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botões de Ação */}
                                    <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-700">
                                        <button
                                            onClick={() => {
                                                if (order.items[0]) {
                                                    handleUpdateStatus(order.id, order.items[0].id, 'READY');
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                        >
                                            ✅ Pronto
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (order.items[0]) {
                                                    handleUpdateStatus(order.id, order.items[0].id, 'PAUSED');
                                                }
                                            }}
                                            className="flex-1 py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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
                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    🖥️ Tela Cheia Ativa
                </div>
            )}
        </div>
    );
}
