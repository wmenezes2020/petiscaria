'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    return await api.get<DashboardStats>('/reports/dashboard');
  } catch {
    // Return default stats if endpoint doesn't exist yet
    return {
      todayRevenue: 0,
      todayOrders: 0,
      averageTicket: 0,
      activeTables: 0,
      preparingOrders: 0,
      lowStockAlerts: 0,
    };
  }
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const statCards = [
    {
      title: 'Faturamento Hoje',
      value: stats?.todayRevenue ? formatCurrency(stats.todayRevenue) : 'R$ 0,00',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Pedidos Hoje',
      value: stats?.todayOrders?.toString() || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Ticket Médio',
      value: stats?.averageTicket ? formatCurrency(stats.averageTicket) : 'R$ 0,00',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Mesas Ativas',
      value: stats?.activeTables?.toString() || '0',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Em Preparo',
      value: stats?.preparingOrders?.toString() || '0',
      icon: UtensilsCrossed,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Alertas Estoque',
      value: stats?.lowStockAlerts?.toString() || '0',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu estabelecimento</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and additional content will be added here */}
    </div>
  );
}

