'use client';

import { useEffect, useRef } from 'react';

/**
 * Toaster Wrapper that mounts react-hot-toast AFTER hydration
 * This prevents any hydration mismatch by mounting completely outside
 * the React hydration cycle
 */
export function ToasterWrapper() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Wait for hydration to complete
    const mountToaster = async () => {
      // Wait for multiple ticks to ensure hydration is complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        // Dynamically import react-hot-toast
        const toastModule = await import('react-hot-toast');
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');

        // Check if container already exists
        let container = document.getElementById('react-hot-toast-root');
        
        if (!container) {
          container = document.createElement('div');
          container.id = 'react-hot-toast-root';
          document.body.appendChild(container);
        }

        // Create root and mount Toaster
        const root = ReactDOM.createRoot(container);
        root.render(
          React.createElement(toastModule.Toaster, {
            position: 'top-right',
            toastOptions: {
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
            },
          })
        );
      } catch (error) {
        console.error('Failed to mount Toaster:', error);
      }
    };

    mountToaster();
  }, []);

  return null;
}
