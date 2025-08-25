'use client';

import { useState, useEffect } from 'react';
import { getTables, TableResponse, getAreas, AreaResponse, getLocations, LocationResponse, createTable, updateTable } from '@/lib/api';
import { TableCard } from '@/components/tables/TableCard';
import { TableFormModal } from '@/components/tables/TableFormModal';
import { PlusCircle, Filter, Search, Grid3X3, List, Table, Edit } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function MesasPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [filteredTables, setFilteredTables] = useState<TableResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const { user, checkAuthStatus } = useAuthStore();

  // Função para mapear status do backend para o frontend
  const mapTableStatus = (backendStatus: string): 'Livre' | 'Ocupada' | 'Reservada' | 'Fechando' | 'Inativa' => {
    const statusMap: Record<string, 'Livre' | 'Ocupada' | 'Reservada' | 'Fechando' | 'Inativa'> = {
      'available': 'Livre',
      'occupied': 'Ocupada',
      'reserved': 'Reservada',
      'closing': 'Fechando',
      'inactive': 'Inativa'
    };
    return statusMap[backendStatus] || 'Inativa';
  };

  useEffect(() => {
    // Verificar status de autenticação
    checkAuthStatus();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tablesData, areasData, locationsData] = await Promise.all([
          getTables(),
          getAreas(),
          getLocations()
        ]);
        setTables(tablesData);
        setFilteredTables(tablesData);
        setAreas(areasData);
        setLocations(locationsData);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        setError('Não foi possível carregar os dados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Removido checkAuthStatus para evitar dependência circular

  // Filtros e busca
  useEffect(() => {
    let filtered = tables;

    // Filtro por área
    if (selectedArea !== 'all') {
      filtered = filtered.filter(table => table.areaId === selectedArea);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(table => {
        const area = areas.find(a => a.id === table.areaId);
        return table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (area && area.name.toLowerCase().includes(searchTerm.toLowerCase()));
      });
    }

    setFilteredTables(filtered);
  }, [tables, selectedArea, searchTerm, areas]);

  const handleSaveTable = async (data: any) => {
    try {
      if (editingTable) {
        // Editar mesa existente
        await updateTable(editingTable.id, data);
      } else {
        // Criar nova mesa
        await createTable(data);
      }

      // Recarregar mesas
      const updatedTables = await getTables();
      setTables(updatedTables);
      setFilteredTables(updatedTables);
      setIsFormOpen(false);
      setEditingTable(null);
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
      setError('Erro ao salvar mesa. Tente novamente.');
    }
  };

  const handleEditTable = (table: TableResponse) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTable(null);
  };

  const canManageTables = user?.role === 'admin' || user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Carregando mesas...</p>
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mapa de Mesas</h1>
            <p className="text-gray-600">Gerencie o layout e configurações das mesas do estabelecimento</p>
          </div>
          <div className="flex space-x-3">
            {/* Botão para criar nova mesa */}
            {canManageTables && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                <PlusCircle size={18} className="mr-2" />
                Nova Mesa
              </button>
            )}
          </div>
        </div>

        {/* Controles de Filtro e Busca */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por número da mesa ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filtro por Área */}
            <div className="lg:w-48">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">Todas as Áreas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modo de Visualização */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Display */}
      {filteredTables.length > 0 ? (
        <div className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Table className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total de Mesas</p>
                  <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tables.filter(t => t.isAvailable).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Ocupadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tables.filter(t => !t.isAvailable).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Reservadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    0
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Mesas */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTables.map((table) => (
                <div key={table.id} className="group">
                  <TableCard
                    tableNumber={parseInt(table.name) || 0}
                    capacity={table.capacity}
                    status={mapTableStatus(table.isAvailable ? 'available' : 'occupied')}
                    area={areas.find(a => a.id === table.areaId)?.name || 'N/A'}
                  />
                  {canManageTables && (
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditTable(table)}
                        className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        Editar Mesa
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Lista de Mesas</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTables.map((table) => (
                  <div key={table.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-700">{table.name}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Mesa {table.name}</p>
                          <p className="text-sm text-gray-500">{areas.find(a => a.id === table.areaId)?.name || 'N/A'} • {table.capacity} pessoas</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${table.isAvailable ? 'bg-green-100 text-green-800' :
                          !table.isAvailable ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {table.isAvailable ? 'Disponível' :
                            'Ocupada'}
                        </span>
                        {canManageTables && (
                          <button
                            onClick={() => handleEditTable(table)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Table className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma mesa encontrada</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedArea !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira mesa'
            }
          </p>
          {canManageTables && !searchTerm && selectedArea === 'all' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <PlusCircle size={18} className="mr-2" />
              Criar Primeira Mesa
            </button>
          )}
        </div>
      )}

      {/* Modal de Formulário */}
      <TableFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveTable}
        table={editingTable || undefined}
        areas={areas}
        locations={locations}
      />
    </div>
  );
}

