import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

// Função para salvar no localStorage e cookies
const saveToStorage = (key: string, value: any) => {
  try {
    // Salvar no localStorage
    localStorage.setItem(key, JSON.stringify(value));
    
    // Salvar no cookie também (para o middleware)
    const cookieValue = JSON.stringify(value);
    document.cookie = `${key}=${encodeURIComponent(cookieValue)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } catch (error) {
    console.error('Erro ao salvar no storage:', error);
  }
};

// Função para ler do localStorage
const getFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Erro ao ler do storage:', error);
    return null;
  }
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string, companyId?: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
      login: async (email: string, password: string, companyId?: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
            companyId,
          });

          const { accessToken, refreshToken, user } = response.data;

          console.log('🔐 Dados de login recebidos:', { accessToken: !!accessToken, refreshToken: !!refreshToken, user });

          // Configurar token no header das requisições ANTES de atualizar o estado
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Atualizar o estado de forma síncrona
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('🔐 Estado atualizado com sucesso');

          // Salvar no storage manualmente
          saveToStorage('auth-storage', {
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });

          // Aguardar um tick para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 0));

        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.post<RegisterResponse>('/auth/register', userData);

          const { accessToken, refreshToken, user } = response.data;

          // Configurar token no header das requisições ANTES de atualizar o estado
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Atualizar o estado de forma síncrona
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Aguardar um tick para garantir que o estado foi atualizado
          await new Promise(resolve => setTimeout(resolve, 0));

        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Erro ao fazer cadastro';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        // Remover token do header das requisições
        delete api.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Limpar storage
        saveToStorage('auth-storage', {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            throw new Error('Token de refresh não encontrado');
          }

          const response = await api.post<{ accessToken: string }>('/auth/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data;

          set({
            accessToken,
            isAuthenticated: true,
          });

          // Atualizar token no header das requisições
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        } catch (error: any) {
          // Se falhar ao renovar o token, fazer logout
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuthStatus: () => {
        const state = get();
        console.log('🔍 Verificando status de autenticação:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasToken: !!state.accessToken
        });
        
        // Verificar se há dados no storage
        const storedData = getFromStorage('auth-storage');
        console.log('📦 Dados armazenados:', storedData);
        
        // Se tem dados no storage mas não no estado, restaurar
        if (storedData && storedData.accessToken && !state.accessToken) {
          console.log('🔄 Restaurando dados do storage');
          set({
            user: storedData.user,
            accessToken: storedData.accessToken,
            refreshToken: storedData.refreshToken,
            isAuthenticated: storedData.isAuthenticated,
          });
          
          // Configurar token no header das requisições
          if (storedData.accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedData.accessToken}`;
          }
        }
        
        // Se tem token mas não está marcado como autenticado, corrigir o estado
        if (state.accessToken && !state.isAuthenticated) {
          console.log('🔧 Corrigindo estado de autenticação');
          set({ isAuthenticated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
