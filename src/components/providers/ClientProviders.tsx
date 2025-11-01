'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Toaster to prevent hydration mismatch
// This MUST be imported dynamically with ssr: false
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
    loading: () => null, // Render nothing while loading
  }
);

/**
 * Client-side providers wrapper
 * Prevents hydration mismatches by ensuring identical server/client render
 * 
 * CRITICAL: This component MUST render the exact same thing on server and client
 * during the initial render to prevent hydration errors.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [canMountToaster, setCanMountToaster] = useState(false);

  useEffect(() => {
    // Wait for React hydration to complete before mounting Toaster
    // Use double requestAnimationFrame to ensure hydration is fully complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Additional small delay to ensure all hydration work is done
        setTimeout(() => {
          setCanMountToaster(true);
        }, 0);
      });
    });
  }, []);

  // CRITICAL: During SSR and initial client render, render ONLY children
  // The server will render this, and the client will render the same thing
  // This prevents hydration mismatch
  // Only mount Toaster AFTER hydration is complete
  return (
    <>
      {children}
      {canMountToaster && (
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
      )}
    </>
  );
}