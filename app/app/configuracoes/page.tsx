'use client';

import { useState } from 'react';
import { 
  Settings, 
  Users, 
  Package, 
  Table, 
  UserCheck,
  ShoppingCart,
  CreditCard,
  FileText,
  LayoutGrid,
  BarChart3,
  Bell,
  Shield
} from 'lucide-react';
import { UsersManagement } from '@/components/settings/UsersManagement';
import { AreasManagement } from '@/components/settings/AreasManagement';
import { CategoriesManagement } from '@/components/settings/CategoriesManagement';
import { ProductsManagement } from '@/components/settings/ProductsManagement';
import { TablesManagement } from '@/components/settings/TablesManagement';
import { CustomersManagement } from '@/components/settings/CustomersManagement';
import { OrdersManagement } from '@/components/settings/OrdersManagement';
import { PaymentsManagement } from '@/components/settings/PaymentsManagement';
import { InventoryManagement } from '@/components/settings/InventoryManagement';
import { ReportsManagement } from '@/components/settings/ReportsManagement';
import { GeneralSettingsManagement } from '@/components/settings/GeneralSettingsManagement';

type SettingTab = 
  | 'users'
  | 'areas'
  | 'categories'
  | 'products'
  | 'tables'
  | 'customers'
  | 'orders'
  | 'payments'
  | 'inventory'
  | 'reports'
  | 'general';

interface TabConfig {
  id: SettingTab;
  label: string;
  icon: React.ElementType;
  description: string;
}

const tabs: TabConfig[] = [
  { id: 'users', label: 'Usuários', icon: Users, description: 'Gestão de usuários e permissões' },
  { id: 'areas', label: 'Áreas', icon: LayoutGrid, description: 'Gestão de áreas e localizações' },
  { id: 'categories', label: 'Categorias', icon: FileText, description: 'Gestão de categorias de produtos' },
  { id: 'products', label: 'Produtos', icon: Package, description: 'Gestão de produtos e cardápio' },
  { id: 'tables', label: 'Mesas', icon: Table, description: 'Gestão de mesas' },
  { id: 'customers', label: 'Clientes', icon: UserCheck, description: 'Gestão de clientes' },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart, description: 'Gestão de pedidos' },
  { id: 'payments', label: 'Pagamentos', icon: CreditCard, description: 'Gestão de pagamentos' },
  { id: 'inventory', label: 'Estoque', icon: Package, description: 'Controle de estoque' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, description: 'Análises e relatórios' },
  { id: 'general', label: 'Geral', icon: Settings, description: 'Configurações gerais' },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('users');

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersManagement />;
      case 'areas':
        return <AreasManagement />;
      case 'categories':
        return <CategoriesManagement />;
      case 'products':
        return <ProductsManagement />;
      case 'tables':
        return <TablesManagement />;
      case 'customers':
        return <CustomersManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'payments':
        return <PaymentsManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <ReportsManagement />;
      case 'general':
        return <GeneralSettingsManagement />;
      default:
        return <UsersManagement />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar com tabs */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Configurações</h1>
              <p className="text-xs text-gray-500">Gestão do sistema</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg
                  ${isActive
                    ? 'bg-white/20'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`
                    text-xs truncate
                    ${isActive ? 'text-white/80' : 'text-gray-500'}
                  `}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
