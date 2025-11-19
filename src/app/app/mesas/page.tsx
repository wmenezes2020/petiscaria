'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Table as TableIcon } from 'lucide-react';
import type { Table } from '@/types';
import { TableForm } from '@/components/forms/table-form';

async function fetchTables(): Promise<Table[]> {
  const response = await api.get<{ tables?: Table[]; data?: Table[] }>('/tables');
  return response.tables || response.data || [];
}

export default function MesasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | undefined>();
  const { data: tables, isLoading, refetch } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      case 'cleaning':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Livre';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'cleaning':
        return 'Limpeza';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mesas</h1>
          <p className="text-muted-foreground">Controle de mesas do salão</p>
        </div>
        <Button onClick={() => {
          setSelectedTable(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Mesa
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables?.map((table) => (
            <Card
              key={table.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedTable(table);
                setIsFormOpen(true);
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Mesa {table.number}
                  </CardTitle>
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusColor(table.status)}`}
                    title={getStatusLabel(table.status)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">{getStatusLabel(table.status)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacidade: <span className="font-medium">{table.capacity} pessoas</span>
                  </p>
                  {table.area && (
                    <p className="text-sm text-muted-foreground">
                      Área: <span className="font-medium">{table.area.name}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TableForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        table={selectedTable}
        onSuccess={() => {
          refetch();
          setIsFormOpen(false);
          setSelectedTable(undefined);
        }}
      />
    </div>
  );
}

