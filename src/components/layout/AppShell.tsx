'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { ChefHat } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AppShellProps {
  children: React.ReactNode;
}

// SOLUÇÃO DEFINITIVA: Componente de loading consistente
function LoadingScreen({ message = 'Carregando…' }: { message?: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4 text-gray-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    checkAuthStatus: state.checkAuthStatus,
  }));

  const [isMounted, setIsMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Verificar autenticação apenas no cliente
    const check = async () => {
      await checkAuthStatus();
      setIsChecking(false);
    };
    
    check();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isMounted || isChecking) return;

    if (!isAuthenticated) {
      const redirectPath = pathname || '/app';
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isMounted, isChecking, isAuthenticated, pathname, router]);

  // CRITICAL: Renderizar SEMPRE o mesmo HTML no servidor e cliente inicialmente
  // Usar suppressHydrationWarning para permitir mudança após mount
  if (!isMounted || isChecking) {
    return <LoadingScreen />;
  }

  // Se não autenticado, mostrar loading durante redirecionamento
  if (!isAuthenticated) {
    return <LoadingScreen message="Redirecionando para o login…" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 shadow-lg border-b border-primary-500">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white drop-shadow-sm">{user?.companyName || 'Petiscaria da Thay'}</h1>
                    <p className="text-xs text-primary-100">Sistema de Gestão</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationsPanel />
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{user?.name || 'Usuário'}</div>
                    <div className="text-xs text-primary-100 capitalize">{user?.role || 'Conectado'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;


