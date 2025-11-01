'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Toaster - NEVER render on server
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Toaster Provider that mounts ONLY on client, AFTER hydration completes
 * This ensures no hydration mismatch and prevents "Only one element on document" errors
 */
export function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Only mount on client, after hydration completes
    if (typeof window === 'undefined') return;

    // Wait for hydration to complete using multiple RAFs
    // This ensures React has finished hydrating before we mount the Toaster
    const mountTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Small additional delay to ensure hydration is fully complete
          setTimeout(() => {
            setMounted(true);
          }, 0);
        });
      });
    }, 0);

    return () => clearTimeout(mountTimeout);
  }, []);

  // NEVER render on server - return null
  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  // React-hot-toast creates its own container, but mounting after hydration prevents conflicts
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
