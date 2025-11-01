'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import do Toaster com SSR desabilitado
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Toaster Wrapper que monta react-hot-toast APÓS a hydration
 * Isso previne hydration mismatch montando completamente fora
 * do ciclo de hydration do React
 */
export function ToasterWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Wait for hydration to complete
    // Use requestAnimationFrame to ensure we're past hydration
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Small delay to ensure hydration is complete
        setTimeout(() => {
          setMounted(true);
        }, 0);
      });
    });
  }, []);

  // NEVER render on server - return null
  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
