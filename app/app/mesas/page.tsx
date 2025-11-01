'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTables, TableResponse, getAreas, AreaResponse } from '@/lib/api';
import dynamic from 'next/dynamic';

const TableCommandModal = dynamic(() => import('@/components/tables/TableCommandModal').then(mod => mod.TableCommandModal), {
  ssr: false,
});
import { Search, Grid3X3, List, Table as TableIcon, Users, Timer, ClipboardList, Clock } from 'lucide-react';
import { TableStatusBadge } from '@/components/tables/TableStatusBadge';

function formatOpenedAt(openedAt?: string | null) {
  if (!openedAt) return 'Sem comanda ativa';
  const date = new Date(openedAt);
  if (Number.isNaN(date.getTime())) return 'Sem comanda ativa';
  return `Aberta às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function MesasPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [filteredTables, setFilteredTables] = useState<TableResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tablesData, areasData] = await Promise.all([
          getTables(),
          getAreas(),
        ]);
        setTables(tablesData);
        setFilteredTables(tablesData);
        setAreas(areasData);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        setError('Não foi possível carregar os dados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshTables = async () => {
    try {
      const updatedTables = await getTables();
      setTables(updatedTables);
      setFilteredTables(updatedTables);
    } catch (err) {
      console.error('Erro ao atualizar mesas:', err);
    }
  };

  useEffect(() => {
    let filtered = tables;

    if (selectedArea !== 'all') {
      filtered = filtered.filter((table) => table.areaId === selectedArea);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((table) => {
        const area = areas.find((a) => a.id === table.areaId);
        return table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (area && area.name.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    setFilteredTables(filtered);
  }, [tables, selectedArea, searchTerm, areas]);

  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'available').length;
    const occupied = tables.filter((t) => t.status === 'occupied').length;
    const reserved = tables.filter((t) => t.status === 'reserved').length;
    const cleaning = tables.filter((t) => t.status === 'cleaning' || t.status === 'out_of_service').length;
    return { total, available, occupied, reserved, cleaning };
  }, [tables]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-primary-700">Carregando mesas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const openCommandModal = (table: TableResponse) => {
    setSelectedTable(table);
    setIsCommandModalOpen(true);
  };

  const closeCommandModal = () => {
    setSelectedTable(null);
    setIsCommandModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Mesas</h1>
          <p className="text-sm text-gray-600">Monitore comandas abertas, disponibilidade e reservas em tempo real.</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por mesa ou área..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={selectedArea}
              onChange={(event) => setSelectedArea(event.target.value)}
              className="input-field"
            >
              <option value="all">Todas as áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex bg-secondary-100 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredTables.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-5 flex items-center">
              <div className="p-3 bg-primary-100 rounded-xl">
                <TableIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total de mesas</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.total}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center">
              <div className="p-3 bg-success-100 rounded-xl">
                <div className="w-6 h-6 bg-success-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Disponíveis</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.available}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center">
              <div className="p-3 bg-danger-100 rounded-xl">
                <div className="w-6 h-6 bg-danger-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Ocupadas</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.occupied}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center">
              <div className="p-3 bg-accent-100 rounded-xl">
                <div className="w-6 h-6 bg-accent-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Reservadas</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.reserved}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Timer className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Em limpeza / manutenção</p>
                <p className="text-3xl font-bold text-secondary-900">{stats.cleaning}</p>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => openCommandModal(table)}
                  className="group relative card p-5 flex flex-col items-start justify-between space-y-4 hover:shadow-xl transition-shadow text-left"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-50 text-primary-600 shadow-sm">
                    <TableIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{table.name}</h3>
                    <p className="text-sm text-secondary-500">{table.area || 'Sem área definida'} • {table.capacity} lugares</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TableStatusBadge status={table.status || 'available'} />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${table.isActive ? 'bg-success-100 text-success-800' : 'bg-secondary-100 text-secondary-700'}`}>
                      {table.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                    {table.currentCustomerCount ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        <Users className="h-3.5 w-3.5 mr-1" /> {table.currentCustomerCount} clientes
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-secondary-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-secondary-400" />
                      {table.currentOrderId ? `Comanda ativa: #${table.currentOrderId.slice(0, 8)}...` : 'Nenhuma comanda aberta'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary-400" />
                      {formatOpenedAt(table.openedAt)}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 bg-primary-50 group-hover:bg-primary-100 transition-colors">
                    Gerenciar mesa
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Lista de mesas</h3>
              </div>
              <div className="divide-y divide-secondary-200">
                {filteredTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => openCommandModal(table)}
                    className="w-full px-6 py-4 hover:bg-secondary-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <TableIcon className="h-6 w-6 text-secondary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{table.name}</p>
                          <p className="text-sm text-secondary-600">{areas.find((a) => a.id === table.areaId)?.name || 'N/A'} • {table.capacity} pessoas</p>
                          <p className="text-xs text-secondary-500 mt-1">{table.currentOrderId ? `Comanda ativa: #${table.currentOrderId.slice(0, 8)}...` : 'Nenhuma comanda aberta'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <TableStatusBadge status={table.status || 'available'} />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${table.isActive ? 'bg-success-100 text-success-800' : 'bg-secondary-100 text-secondary-800'}`}>
                          {table.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TableIcon className="h-12 w-12 text-secondary-400" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900">Nenhuma mesa encontrada</h3>
          <p className="text-secondary-600 max-w-md">
            {searchTerm || selectedArea !== 'all'
              ? 'Não encontramos mesas que correspondam aos seus critérios de busca. Tente ajustar os filtros.'
              : 'Cadastre mesas em Configurações > Mesas para começar a gerenciar comandas por aqui.'}
          </p>
        </div>
      )}

      <TableCommandModal
        table={selectedTable}
        isOpen={isCommandModalOpen}
        onClose={closeCommandModal}
        onRefresh={refreshTables}
      />
    </div>
  );
}

