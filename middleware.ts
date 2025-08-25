import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Definição de perfis e suas rotas permitidas
const roleRoutes: Record<string, string[]> = {
  admin: ['/app/dashboard', '/app/pedidos', '/app/mesas', '/app/cardapio', '/app/estoque', '/app/financeiro', '/app/relatorios', '/app/configuracoes', '/app/kds', '/app/clientes'],
  manager: ['/app/dashboard', '/app/pedidos', '/app/mesas', '/app/cardapio', '/app/estoque', '/app/financeiro', '/app/relatorios', '/app/configuracoes', '/app/kds', '/app/clientes'],
  waiter: ['/app/pedidos', '/app/mesas'],
  kitchen: ['/app/kds'],
  cashier: ['/app/financeiro', '/app/pedidos'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas que não devem ser interceptadas pelo middleware
  const publicRoutes = ['/login', '/register', '/', '/kds'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Se for rota pública, permitir acesso direto
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar cookies de autenticação
  const authCookie = request.cookies.get('auth-storage')?.value;
  let userRole: string | null = null;
  let isAuthenticated = false;

  if (authCookie) {
    try {
      // Tentar parsear o cookie
      const parsedCookie = JSON.parse(authCookie);
      
      // O Zustand pode salvar de diferentes formas
      if (parsedCookie.state) {
        // Formato padrão do Zustand persist
        isAuthenticated = parsedCookie.state.isAuthenticated || false;
        userRole = parsedCookie.state.user?.role || null;
      } else if (parsedCookie.isAuthenticated !== undefined) {
        // Formato direto
        isAuthenticated = parsedCookie.isAuthenticated;
        userRole = parsedCookie.user?.role || null;
      }
    } catch (e) {
      // Cookie malformado, tratar como não autenticado
      isAuthenticated = false;
      userRole = null;
    }
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado, verificar permissões
  const allowedRoutes = userRole ? roleRoutes[userRole.toLowerCase()] || [] : [];
  
  // Permitir acesso ao dashboard para todos os perfis autenticados
  if (pathname === '/app/dashboard' || allowedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Se não tiver permissão, redireciona para o dashboard
  console.log(`Acesso negado para ${pathname} - Usuário: ${userRole} - Rotas permitidas:`, allowedRoutes);
  return NextResponse.redirect(new URL('/app/dashboard', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


