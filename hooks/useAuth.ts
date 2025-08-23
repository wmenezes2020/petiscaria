import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useAuth(requireAuth: boolean = true) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Aguardar um tick para garantir que o estado foi atualizado
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          // Se precisa de autenticação mas não está autenticado, redirecionar para login
          router.push('/login');
        } else if (!requireAuth && isAuthenticated) {
          // Se não precisa de autenticação mas está autenticado, redirecionar para dashboard
          router.push('/app/dashboard');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, requireAuth, router]);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}

export function useRequireGuest() {
  return useAuth(false);
}
