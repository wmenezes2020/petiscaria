'use client';

import dynamic from 'next/dynamic';

// Dynamically import Toaster - NEVER render on server
// This component will ONLY render on client, preventing hydration mismatch
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Toaster Provider that mounts ONLY on client
 * 
 * CRITICAL: This component is imported via dynamic() with ssr: false in the root layout,
 * which means it will NEVER be included in the server-rendered HTML.
 * This completely prevents hydration mismatch issues.
 * 
 * The Toaster component from react-hot-toast will handle its own mounting
 * and container creation after hydration completes.
 */
export function ToasterProvider() {
  // Since this is imported with ssr: false, it never renders on server
  // and only renders on client after the page loads
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
