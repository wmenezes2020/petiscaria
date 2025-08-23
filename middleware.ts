import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Definição de perfis e suas rotas permitidas
const roleRoutes: Record<string, string[]> = {
  admin: ['/app/dashboard', '/app/pedidos', '/app/mesas', '/app/cardapio', '/app/estoque', '/app/financeiro', '/app/relatorios', '/app/configuracoes', '/app/kds'],
  manager: ['/app/dashboard', '/app/pedidos', '/app/mesas', '/app/cardapio', '/app/estoque', '/app/financeiro', '/app/relatorios', '/app/configuracoes', '/app/kds'],
  waiter: ['/app/pedidos', '/app/mesas'],
  kitchen: ['/app/kds'],
  cashier: ['/app/financeiro', '/app/pedidos'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // O Next.js armazena o valor do `persist` como uma string JSON.
  const authCookie = request.cookies.get('auth-storage')?.value;
  let userRole: string | null = null;
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const { state } = JSON.parse(authCookie);
      isAuthenticated = state?.isAuthenticated || false;
      userRole = state?.user?.role || null;
    } catch (e) {
      // Cookie malformado, tratar como não autenticado
    }
  }

  // Se for rota pública e estiver autenticado, redireciona para o dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  // Se não for rota pública e não estiver autenticado, redireciona para o login
  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado, verificar permissões
  if (isAuthenticated && !isPublicRoute) {
    const allowedRoutes = userRole ? roleRoutes[userRole.toLowerCase()] || [] : [];
    
    // Permitir acesso ao dashboard para todos os perfis autenticados
    if (pathname === '/app/dashboard' || allowedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    // Se não tiver permissão, redireciona para uma página de acesso negado ou dashboard
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
