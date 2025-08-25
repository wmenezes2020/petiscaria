import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Petiscaria da Thay - Sistema de Gestão',
  description: 'Sistema completo de gestão para petiscarias, bares e restaurantes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">Petiscaria da Thay</h1>
                <div className="flex items-center space-x-4">
                  <NotificationsPanel />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Admin</span>
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
      </body>
    </html>
  );
}