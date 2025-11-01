'use client';

import '../globals.css';
import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('@/components/layout/AppShell').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4 text-gray-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-sm font-medium">Carregando painel…</p>
      </div>
    </div>
  ),
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}