import { api } from './api';
import type { AuthResponse, LoginCredentials } from '@/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  // Token is stored in httpOnly cookie by backend
  // User will be stored in Zustand store by the component
  return response;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  return response;
}

