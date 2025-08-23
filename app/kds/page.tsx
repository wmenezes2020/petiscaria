'use client';

import { useState, useEffect } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, RefreshCw } from 'lucide-react';

export default function KdsPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Atualizar relógio a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Detectar mudanças no fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleUpdateStatus = (orderId: string, newStatus: string) => {
        // Tocar som de notificação se habilitado
        if (soundEnabled) {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => {
                // Ignorar erro se o som não puder ser reproduzido
            });
        }

        console.log(`Pedido ${orderId} atualizado para: ${newStatus}`);
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

    // Dados mock para demonstração (similar à imagem)
    const mockOrders = [
        {
            id: '01262374254',
            orderNumber: '01262374254',
            customer: { name: 'Rustem Iskand' },
            table: { number: null },
            type: 'Delivery/Sarah Bauman',
            time: '16:27:38',
            timeColor: 'text-yellow-400',
            items: [
                '2 x Cappuccino Oat milk',
                '3 x Cheesecake',
                '1 x Hazelnut Mocha',
                '3 x Muffin'
            ],
            status: 'preparing',
            buttons: ['Done', 'Hold']
        },
        {
            id: '01262375483',
            orderNumber: '01262375483',
            customer: { name: 'Rustem Iskand' },
            table: { number: null },
            type: 'Quicksale/Walk-in',
            time: '16:28:22',
            timeColor: 'text-yellow-400',
            items: [
                '1 x Latte',
                '1 x Flat white Chocolate topping',
                '2 x Omelet',
                '1 x Croissant with jam'
            ],
            status: 'preparing',
            buttons: ['Done', 'Hold']
        },
        {
            id: '01262760952',
            orderNumber: '01262760952',
            customer: { name: 'Catherine Wills' },
            table: { number: null },
            type: 'Delivery/Matthew Handson',
            time: '15:29:14',
            timeColor: 'text-red-400',
            items: [
                '1 x Classic Beyond Burger Extra sauce',
                '2 x Falafel and Hummus No salt',
                '1 x Grilled vegetables'
            ],
            status: 'preparing',
            buttons: ['Done', 'Hold']
        },
        {
            id: '01262377121',
            orderNumber: '01262377121',
            customer: { name: 'Rustem Iskand' },
            table: { number: null },
            type: 'Quicksale/Oliver Dark',
            time: '15:30:31',
            timeColor: 'text-red-400',
            items: [
                '2 x Egg Flower soup',
                '3 x Fried shrimp Sweet and sour sauce',
                '1 x Fried rice No peanuts'
            ],
            status: 'preparing',
            buttons: ['Done', 'Hold']
        }
    ];

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
                    {mockOrders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white text-gray-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-200 border-l-4 border-blue-500"
                        >
                            {/* Header do Pedido */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-bold text-gray-800">#{order.orderNumber}</span>
                                    <span className={`text-sm font-semibold ${order.timeColor}`}>
                                        {order.time}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">{order.customer.name}</div>
                                <div className="text-sm font-medium text-blue-600">{order.type}</div>
                            </div>

                            {/* Itens do Pedido */}
                            <div className="flex-1 mb-6">
                                <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="text-sm text-gray-800 leading-relaxed">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex space-x-3">
                                {order.buttons.map((button, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleUpdateStatus(order.id, button === 'Done' ? 'ready' : 'hold')}
                                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${button === 'Done'
                                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {button === 'Done' ? '✅ Pronto' : '⏸️ Pausar'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
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
