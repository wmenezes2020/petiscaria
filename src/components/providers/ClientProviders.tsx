'use client';

/**
 * Client-side providers wrapper
 * CRITICAL: This component MUST render EXACTLY the same on server and client
 * to prevent hydration errors.
 * 
 * The Toaster is completely removed from this component to prevent
 * any hydration mismatches. It will be mounted separately via ToasterProvider.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  // CRITICAL: Render ONLY children - nothing else
  // This ensures server and client render identically
  return <>{children}</>;
}