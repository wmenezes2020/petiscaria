'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, Clock, Trash2 } from 'lucide-react';

interface Notification {
    id: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionUrl?: string;
}

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Simular notificações
        const mockNotifications: Notification[] = [
            {
                id: '1',
                type: 'SUCCESS',
                title: 'Pedido Concluído',
                message: 'Pedido #12345 foi entregue com sucesso',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
                isRead: false
            },
            {
                id: '2',
                type: 'WARNING',
                title: 'Estoque Baixo',
                message: 'Produto "Batata Frita" está com estoque baixo',
                timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
                isRead: false
            },
            {
                id: '3',
                type: 'INFO',
                title: 'Novo Cliente',
                message: 'Cliente "João Silva" foi cadastrado',
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
                isRead: true
            },
            {
                id: '4',
                type: 'ERROR',
                title: 'Erro no Sistema',
                message: 'Falha na conexão com o servidor de pagamentos',
                timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
                isRead: false
            }
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }, []);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
    };

    const deleteNotification = (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return <Check className="h-5 w-5 text-green-600" />;
            case 'WARNING':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'ERROR':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            case 'INFO':
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return 'border-l-green-500 bg-green-50';
            case 'WARNING':
                return 'border-l-yellow-500 bg-yellow-50';
            case 'ERROR':
                return 'border-l-red-500 bg-red-50';
            case 'INFO':
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        if (hours < 24) return `${hours} h atrás`;
        if (days < 7) return `${days} dias atrás`;
        return timestamp.toLocaleDateString('pt-BR');
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={togglePanel}
                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden origin-top-right transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scaleIn">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Notificações</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                                <button
                                    onClick={togglePanel}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center bg-gray-50">
                                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-gray-700">Nenhuma notificação</p>
                                <p className="text-sm text-gray-500 mt-1">Você está em dia com suas notificações!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                                            } transition-all duration-200 ease-in-out hover:bg-opacity-100 group relative`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-0.5 p-1 rounded-full bg-white shadow-sm">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-base font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                        } leading-tight`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-gray-500 flex items-center ml-2 flex-shrink-0">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatTimestamp(notification.timestamp)}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'
                                                    }`}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                                                        >
                                                            Marcar como lida
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setNotifications([])}
                                className="w-full text-sm text-gray-600 hover:text-gray-800 text-center font-medium"
                            >
                                Limpar todas as notificações
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={togglePanel}
                />
            )}
        </div>
    );
}


