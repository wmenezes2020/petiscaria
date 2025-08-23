import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

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
