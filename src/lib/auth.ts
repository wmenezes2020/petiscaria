import { api } from './api';
import { clearAuthTokens, getRefreshTokenFromStorage, setAuthTokens } from './auth-cookies';
import type { AuthResponse, LoginCredentials } from '@/types';

async function persistServerSession(tokens: Pick<AuthResponse, 'accessToken' | 'refreshToken' | 'expiresIn'>) {
  await fetch('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokens),
  });
}

async function clearServerSession() {
  await fetch('/api/session', {
    method: 'DELETE',
  });
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  setAuthTokens(response);
  await persistServerSession(response);
  return response;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshTokenFromStorage();
  await api.post('/auth/logout', refreshToken ? { refreshToken } : undefined);
  clearAuthTokens();
  await clearServerSession();
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  setAuthTokens(response);
  await persistServerSession(response);
  return response;
}

