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
 * Uses a delayed mount to ensure React hydration is fully complete
 */
export function ToasterProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // CRITICAL: Wait for hydration to complete
    // Use a combination of RAF and setTimeout to ensure we're past hydration
    let mounted = false;
    
    const mount = () => {
      if (mounted) return;
      
      // Wait for next frame (after React hydration)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Additional delay to be absolutely sure hydration is done
          setTimeout(() => {
            mounted = true;
            setMounted(true);
          }, 50);
        });
      });
    };

    // Only mount if we're in the browser
    if (typeof window !== 'undefined') {
      mount();
    }
  }, []);

  // NEVER render on server - return null
  if (typeof window === 'undefined') {
    return null;
  }

  // Only render after mounting on client
  if (!mounted) {
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