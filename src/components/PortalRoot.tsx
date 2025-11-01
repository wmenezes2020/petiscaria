'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * CRITICAL: Sistema centralizado de portals para evitar "Only one element on document allowed"
 * Este sistema garante que apenas UM container seja criado e usado por todos os portals
 * 
 * SOLUÇÃO DEFINITIVA: Usar singleton pattern e garantir que seja criado apenas uma vez
 */
let portalContainer: HTMLDivElement | null = null;
let isInitializing = false;
let initResolve: ((container: HTMLDivElement) => void) | null = null;
let initReject: ((error: Error) => void) | null = null;

/**
 * Inicializa o container de portals de forma segura e singleton
 * Garante que seja criado apenas uma vez, mesmo se chamado múltiplas vezes
 */
function ensurePortalContainer(): Promise<HTMLDivElement> {
  // CRITICAL: Nunca acessar document durante SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Cannot initialize portal container during SSR'));
  }

  // Se o container já existe e está no DOM, retorna imediatamente
  if (portalContainer && portalContainer.parentNode === document.body) {
    return Promise.resolve(portalContainer);
  }

  // Se já existe no DOM mas não está na variável, usar ele
  const existing = document.getElementById('react-portal-root') as HTMLDivElement;
  if (existing && existing.parentNode === document.body) {
    portalContainer = existing;
    return Promise.resolve(existing);
  }

  // Se já está inicializando, aguardar a promise existente
  if (isInitializing && initResolve) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (portalContainer && portalContainer.parentNode === document.body) {
          clearInterval(checkInterval);
          resolve(portalContainer);
        } else if (!isInitializing) {
          clearInterval(checkInterval);
          reject(new Error('Failed to initialize portal container'));
        }
      }, 10);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (portalContainer && portalContainer.parentNode === document.body) {
          resolve(portalContainer);
        } else {
          reject(new Error('Timeout initializing portal container'));
        }
      }, 1000);
    });
  }

  // Iniciar criação do container
  isInitializing = true;
  
  return new Promise<HTMLDivElement>((resolve, reject) => {
    initResolve = resolve;
    initReject = reject;

    try {
      // CRITICAL: Verificar se document.body existe
      if (!document.body) {
        // Aguardar que document.body esteja disponível
        const observer = new MutationObserver(() => {
          if (document.body && !portalContainer) {
            try {
              // Verificar novamente se já existe
              const existing = document.getElementById('react-portal-root') as HTMLDivElement;
              if (existing && existing.parentNode === document.body) {
                portalContainer = existing;
                isInitializing = false;
                observer.disconnect();
                if (initResolve) initResolve(portalContainer);
                initResolve = null;
                initReject = null;
                return;
              }

              // Criar novo container
              portalContainer = document.createElement('div');
              portalContainer.id = 'react-portal-root';
              portalContainer.style.position = 'fixed';
              portalContainer.style.top = '0';
              portalContainer.style.left = '0';
              portalContainer.style.right = '0';
              portalContainer.style.bottom = '0';
              portalContainer.style.pointerEvents = 'none';
              portalContainer.style.zIndex = '9999';
              
              // CRITICAL: Verificar se já não existe no body antes de append
              if (!document.getElementById('react-portal-root')) {
                document.body.appendChild(portalContainer);
              } else {
                // Se já existe, usar o existente
                portalContainer = document.getElementById('react-portal-root') as HTMLDivElement;
              }
              
              isInitializing = false;
              observer.disconnect();
              if (initResolve) initResolve(portalContainer);
              initResolve = null;
              initReject = null;
            } catch (error) {
              isInitializing = false;
              observer.disconnect();
              if (initReject) initReject(error as Error);
              initResolve = null;
              initReject = null;
            }
          }
        });
        
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      } else {
        // document.body já existe
        try {
          // Verificar se já existe no DOM
          const existing = document.getElementById('react-portal-root') as HTMLDivElement;
          if (existing && existing.parentNode === document.body) {
            portalContainer = existing;
            isInitializing = false;
            if (initResolve) initResolve(portalContainer);
            initResolve = null;
            initReject = null;
            return;
          }

          // Criar novo container
          portalContainer = document.createElement('div');
          portalContainer.id = 'react-portal-root';
          portalContainer.style.position = 'fixed';
          portalContainer.style.top = '0';
          portalContainer.style.left = '0';
          portalContainer.style.right = '0';
          portalContainer.style.bottom = '0';
          portalContainer.style.pointerEvents = 'none';
          portalContainer.style.zIndex = '9999';
          
          // CRITICAL: Verificar se já não existe antes de append
          if (!document.getElementById('react-portal-root')) {
            document.body.appendChild(portalContainer);
          } else {
            // Se já existe, usar o existente
            portalContainer = document.getElementById('react-portal-root') as HTMLDivElement;
          }
          
          isInitializing = false;
          if (initResolve) initResolve(portalContainer);
          initResolve = null;
          initReject = null;
        } catch (error) {
          isInitializing = false;
          if (initReject) initReject(error as Error);
          initResolve = null;
          initReject = null;
        }
      }
    } catch (error) {
      isInitializing = false;
      if (initReject) initReject(error as Error);
      initResolve = null;
      initReject = null;
    }
  });
}

/**
 * Hook para obter o container de portals de forma segura
 */
export function usePortalContainer() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // CRITICAL: Apenas no cliente e apenas uma vez
    if (typeof window === 'undefined' || initRef.current) return;
    initRef.current = true;

    let cancelled = false;

    // Inicializar container
    ensurePortalContainer()
      .then((container) => {
        if (!cancelled) {
          setContainer(container);
          setMounted(true);
        }
      })
      .catch((error) => {
        console.error('Failed to initialize portal container:', error);
        if (!cancelled) {
          setMounted(false);
        }
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
  if (typeof window === 'undefined' || !portalContainer || portalContainer.parentNode !== document.body) {
    return null;
  }

  return createPortal(children, portalContainer) as React.ReactElement;
}
