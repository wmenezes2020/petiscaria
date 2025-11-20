import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'accessTokenServer';
const REFRESH_TOKEN_COOKIE = 'refreshTokenServer';
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.accessToken || !body?.refreshToken) {
    return NextResponse.json({ message: 'Tokens are required' }, { status: 400 });
  }

  const accessMaxAge = Math.max(body.expiresIn ?? 3600, 60);
  const response = NextResponse.json({ message: 'Session stored' });

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: body.accessToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: accessMaxAge,
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: body.refreshToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: 'Session cleared' });
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}

