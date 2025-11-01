import type { Metadata } from 'next';
import '../globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { ChefHat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Petiscaria da Thay - Sistema de Gestão',
  description: 'Sistema completo de gestão para petiscarias, bares e restaurantes',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 shadow-lg border-b border-primary-500">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white drop-shadow-sm">Petiscaria da Thay</h1>
                    <p className="text-xs text-primary-100">Sistema de Gestão</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationsPanel />
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-bold">A</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">Admin</div>
                    <div className="text-xs text-primary-100">Online</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}