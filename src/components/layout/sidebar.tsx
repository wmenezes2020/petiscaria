
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut,
  ChefHat,
  Table,
  TrendingUp,
  Package,
  UserCheck,
  ChevronRight,
  Bell,
  X,
} from 'lucide-react';

const navCategories = [
  {
    title: 'Operações',
    items: [
      { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral' },
      { href: '/app/mesas', label: 'Mesas', icon: Table, description: 'Gestão de mesas' },
      { href: '/app/pedidos', label: 'Pedidos', icon: ClipboardList, description: 'Controle de pedidos' },
      { href: '/kds', label: 'KDS Cozinha', icon: ChefHat, description: 'Sistema de cozinha' },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { href: '/app/cardapio', label: 'Cardápio', icon: Box, description: 'Produtos e preços' },
      { href: '/app/estoque', label: 'Estoque', icon: Package, description: 'Controle de estoque' },
      { href: '/app/clientes', label: 'Clientes', icon: UserCheck, description: 'Base de clientes' },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/app/financeiro', label: 'Financeiro', icon: BarChart2, description: 'Controle financeiro' },
      { href: '/app/relatorios', label: 'Relatórios', icon: TrendingUp, description: 'Análises e métricas' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { href: '/app/configuracoes', label: 'Configurações', icon: Settings, description: 'Configurações do sistema' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-80'} transition-all duration-300 ease-in-out flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-xl relative`}>
      <div className="h-20 flex items-center justify-between px-6 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 border-b border-primary-500/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white shadow-sm">
            <ChefHat className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-white">Petiscaria</h1>
              <p className="text-xs font-medium text-primary-100/80">Sistema de Gestão</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      <div className="px-4 py-6 border-b border-gray-100">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl hover:shadow-md transition-all duration-200`}>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Wesley Menezes'}</p>
              <p className="text-xs text-gray-500 capitalize font-medium">{user?.role || 'Administrador'}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {navCategories.map((category) => (
          <div key={category.title}>
            {!isCollapsed && (
              <div className="flex items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{category.title}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-3"></div>
              </div>
            )}
            <div className="space-y-2">
              {category.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const baseClasses = `group relative flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-medium rounded-2xl transition-colors duration-200 border`;
                const activeClasses = 'bg-primary-50 text-primary-700 border-primary-200 shadow-inner';
                const inactiveClasses = 'bg-white text-gray-600 border-transparent hover:text-primary-700 hover:bg-primary-50/70 hover:border-primary-100';

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"></div>
                    )}
                    <div
                      className={`relative p-2 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-primary-600 border-primary-200'
                          : 'bg-gray-100 text-gray-500 border-transparent group-hover:bg-primary-100 group-hover:text-primary-700'
                      } ${isCollapsed ? '' : 'mr-4'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label === 'Pedidos' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">3</span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold truncate ${isActive ? 'text-primary-800' : ''}`}>{item.label}</span>
                          <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'text-primary-500 rotate-90' : 'text-gray-400 group-hover:translate-x-1'}`} />
                        </div>
                        <p className={`text-xs mt-1 transition-colors duration-200 truncate ${isActive ? 'text-primary-500/80' : 'text-gray-400 group-hover:text-gray-600'}`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">3 Novos Pedidos</p>
                <p className="text-xs text-gray-600">Aguardando confirmação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} text-sm font-medium rounded-2xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group`}
        >
          <div className="p-2 rounded-xl bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-200">
            <LogOut className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="ml-4 font-semibold">Sair do Sistema</span>
          )}
        </button>
      </div>
    </aside>
  );
}
