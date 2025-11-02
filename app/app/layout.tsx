'use client';

import '../globals.css';
import  AppShell from '@/components/layout/AppShell';

// SOLUÇÃO DEFINITIVA: Remover dynamic import
// Renderizar SEMPRE o mesmo HTML no servidor e cliente
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
