'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * CRITICAL: Sistema centralizado de portals para evitar "Only one element on document allowed"
 * Este sistema garante que apenas UM container seja criado e usado por todos os portals
 */
let portalContainer: HTMLDivElement | null = null;
let isContainerReady = false;
let initPromise: Promise<HTMLDivElement> | null = null;

/**
 * Inicializa o container de portals de forma segura
 * Garante que seja criado apenas uma vez, mesmo em produção
 */
function initializePortalContainer(): Promise<HTMLDivElement> {
  // Se já existe uma promise de inicialização, retorna ela
  if (initPromise) {
    return initPromise;
  }

  // CRITICAL: Nunca acessar document durante SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Cannot initialize portal container during SSR'));
  }

  // Se o container já existe, retorna imediatamente
  if (portalContainer && isContainerReady) {
    return Promise.resolve(portalContainer);
  }

  // Criar promise de inicialização
  initPromise = new Promise<HTMLDivElement>((resolve, reject) => {
    try {
      // Verificar se já existe no DOM (pode ter sido criado por outra instância)
      const existing = document.getElementById('react-portal-root') as HTMLDivElement;
      if (existing) {
        portalContainer = existing;
        isContainerReady = true;
        resolve(existing);
        return;
      }

      // Criar novo container apenas se não existir
      portalContainer = document.createElement('div');
      portalContainer.id = 'react-portal-root';
      portalContainer.style.position = 'fixed';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.right = '0';
      portalContainer.style.bottom = '0';
      portalContainer.style.pointerEvents = 'none';
      portalContainer.style.zIndex = '9999';
      
      // CRITICAL: Verificar se document.body existe antes de append
      if (!document.body) {
        // Aguardar que document.body esteja disponível
        const observer = new MutationObserver(() => {
          if (document.body && portalContainer) {
            document.body.appendChild(portalContainer);
            isContainerReady = true;
            observer.disconnect();
            resolve(portalContainer);
          }
        });
        
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } else {
        document.body.appendChild(portalContainer);
        isContainerReady = true;
        resolve(portalContainer);
      }
    } catch (error) {
      reject(error);
    }
  });

  return initPromise;
}

/**
 * Hook para obter o container de portals de forma segura
 */
export function usePortalContainer() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Apenas no cliente
    if (typeof window === 'undefined') return;

    let cancelled = false;

    // Inicializar container
    initializePortalContainer()
      .then((container) => {
        if (!cancelled) {
          setContainer(container);
          setMounted(true);
        }
      })
      .catch((error) => {
        console.error('Failed to initialize portal container:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { container, mounted };
}

/**
 * Componente Portal seguro que usa o container centralizado
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const { container, mounted } = usePortalContainer();

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
}

/**
 * Função helper para usar createPortal com o container centralizado
 * Útil para componentes que preferem não usar o componente Portal
 */
export function createSafePortal(children: React.ReactNode): React.ReactElement | null {
  // Esta função só funciona no cliente após inicialização
  // Componentes devem usar o hook usePortalContainer ou o componente Portal
  if (typeof window === 'undefined' || !portalContainer || !isContainerReady) {
    return null;
  }

  return createPortal(children, portalContainer) as React.ReactElement;
}
