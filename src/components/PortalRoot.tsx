'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Creates a dedicated container for portals to avoid conflicts with document.body
 * This prevents "Only one element on document allowed" errors
 */
let portalContainer: HTMLDivElement | null = null;

function getPortalContainer(): HTMLDivElement | null {
  // CRITICAL: Never access document during SSR
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'react-portal-root';
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.zIndex = '9999';
    document.body.appendChild(portalContainer);
  }

  return portalContainer;
}

/**
 * Safe portal component that uses a dedicated container
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only mount on client
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    const portalContainer = getPortalContainer();
    if (portalContainer) {
      setContainer(portalContainer);
    }

    return () => {
      // Cleanup on unmount
      // Keep container alive for performance
    };
  }, []);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
}
