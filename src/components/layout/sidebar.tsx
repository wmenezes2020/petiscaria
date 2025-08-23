
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Box,
  ShoppingBasket,
  ClipboardList,
  BarChart2,
  Settings,
  ChevronRight,
  LogOut,
  CookingPot,
  Table,
} from 'lucide-react';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/mesas', label: 'Mesas', icon: Table },
  { href: '/app/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/app/kds', label: 'KDS Cozinha', icon: CookingPot },
  { href: '/app/cardapio', label: 'Cardápio', icon: Box },
  { href: '/app/estoque', label: 'Estoque', icon: ShoppingBasket },
  { href: '/app/financeiro', label: 'Financeiro', icon: BarChart2 },
  { href: '/app/relatorios', label: 'Relatórios', icon: BarChart2 },
  { href: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center px-4 bg-gray-900">
        <h1 className="text-xl font-bold text-orange-400">Petiscaria</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`
              flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
              ${
                pathname.startsWith(item.href)
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-2 py-4 border-t border-gray-700">
        <Link
          href="/logout"
          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
