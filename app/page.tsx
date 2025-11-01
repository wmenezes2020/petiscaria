// CRITICAL: Página completamente estática - SEM SSR para evitar hydration mismatch
// Esta página será renderizada APENAS no cliente

'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Aguardar que a hidratação esteja completamente finalizada
    // Usar múltiplos requestAnimationFrame para garantir que passamos pela hidratação
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      // Aguardar que React complete a hidratação
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // CRITICAL: NUNCA renderizar no servidor
  // Retornar null durante SSR e inicialização
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Petiscaria da Thay
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de gestão para petiscarias
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors inline-block"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="border-2 border-orange-600 text-orange-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors inline-block"
          >
            Criar Conta
          </a>
        </div>
      </div>
    </div>
  );
}
