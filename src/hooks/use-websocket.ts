import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function useWebSocket(channel: string, onMessage: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.tenantId) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('join', `tenant:${user.tenantId}:${channel}`);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on(`tenant:${user.tenantId}:${channel}`, onMessage);

    return () => {
      socket.emit('leave', `tenant:${user.tenantId}:${channel}`);
      socket.disconnect();
    };
  }, [user?.tenantId, channel, onMessage]);

  return socketRef.current;
}


