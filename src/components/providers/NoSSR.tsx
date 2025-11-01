'use client';

import { useEffect, useState } from 'react';

/**
 * Component that only renders its children on the client
 * Prevents hydration mismatches by ensuring server renders nothing
 */
export function NoSSR({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
