'use client';

import { useEffect, useState } from 'react';

/**
 * SOLUÇÃO DEFINITIVA: Wrapper que garante renderização APENAS no cliente
 * Previne QUALQUER hydration mismatch causado por stores/localStorage
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: Servidor e primeira render do cliente retornam fallback
  // Apenas após mount completo, renderiza children
  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

