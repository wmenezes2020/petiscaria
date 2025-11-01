import { useEffect, useState } from 'react';

/**
 * Hook para garantir que portals sejam criados apenas no cliente
 * Evita erros de hydration e múltiplos elementos no document.body
 */
export function usePortal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted;
}
