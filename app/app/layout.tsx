import type { Metadata } from 'next';
import '../globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Petiscaria da Thay - Sistema de Gestão',
  description: 'Sistema completo de gestão para petiscarias, bares e restaurantes',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}