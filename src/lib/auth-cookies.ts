import type { AuthResponse } from '@/types';

const ACCESS_TOKEN_KEY = 'petiscaria.accessToken';
const REFRESH_TOKEN_KEY = 'petiscaria.refreshToken';
const EXPIRES_AT_KEY = 'petiscaria.accessTokenExpiresAt';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function setAuthTokens(response: Pick<AuthResponse, 'accessToken' | 'refreshToken' | 'expiresIn'>) {
  if (!isBrowser() || !response.accessToken || !response.refreshToken) return;
  const expiresAt = Date.now() + (response.expiresIn ?? 3600) * 1000;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  window.localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
}

export function clearAuthTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_AT_KEY);
}

export function getAccessTokenFromStorage(): string | undefined {
  if (!isBrowser()) return undefined;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function getRefreshTokenFromStorage(): string | undefined {
  if (!isBrowser()) return undefined;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
}

export function getAccessTokenExpiration(): number | undefined {
  if (!isBrowser()) return undefined;
  const value = window.localStorage.getItem(EXPIRES_AT_KEY);
  return value ? Number(value) : undefined;
}

