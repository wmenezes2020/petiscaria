'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Key, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

async function fetchUsers(): Promise<any[]> {
  try {
    const response = await api.get<{ users?: any[]; data?: any[] }>('/users');
    return response.users || response.data || [];
  } catch {
    return [];
  }
}

export default function ConfiguracoesPage() {
  const { user } = useAuthStore();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerenciar configurações do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerenciar usuários e permissões do sistema
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Usuários
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Integrações PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configurar integrações de pagamento PIX
            </p>
            <Button variant="outline" className="w-full">
              Configurar PIX
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configurar preferências de notificações
            </p>
            <Button variant="outline" className="w-full">
              Configurar Notificações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configurações de segurança e autenticação
            </p>
            <Button variant="outline" className="w-full">
              Configurar Segurança
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-medium">{user?.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Perfil</p>
              <p className="font-medium">{user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

