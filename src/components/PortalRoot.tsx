'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Creates a dedicated container for portals to avoid conflicts with document.body
 * This prevents "Only one element on document allowed" errors
 */
let portalContainer: HTMLDivElement | null = null;

function getPortalContainer(): HTMLDivElement {
  if (typeof window === 'undefined') {
    // SSR: return a dummy div (won't be used)
    return document.createElement('div');
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
    setMounted(true);
    const portalContainer = getPortalContainer();
    setContainer(portalContainer);

    return () => {
      // Cleanup on unmount
      if (portalContainer && portalContainer.parentNode === document.body) {
        // Only remove if no other portals are using it
        // We'll keep it alive for performance
      }
    };
  }, []);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
}
