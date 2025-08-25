import { getUsers, UserResponse } from '@/lib/api';
import { InviteUserForm } from '@/components/settings/InviteUserForm';
import { UsersTable } from '@/components/settings/UsersTable';
import { AreasManagement } from '@/components/settings/AreasManagement';
import { CategoriesManagement } from '@/components/settings/CategoriesManagement';
import { ProductsManagement } from '@/components/settings/ProductsManagement';
import { TablesManagement } from '@/components/settings/TablesManagement';
import { CustomersManagement } from '@/components/settings/CustomersManagement';
import { OrdersManagement } from '@/components/settings/OrdersManagement';
import { PaymentsManagement } from '@/components/settings/PaymentsManagement';
import { InventoryManagement } from '@/components/settings/InventoryManagement';
import { ReportsPanel } from '@/components/reports/ReportsPanel';

export default async function ConfiguracoesPage() {
  let users: UserResponse[] = [];
  let error = null;

  try {
    users = await getUsers();
  } catch (e) {
    console.error('Failed to fetch users:', e);
    error = 'Não foi possível carregar a lista de usuários.';
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>

      <div className="space-y-10">
        {/* Gestão de Usuários */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Usuários</h2>
          <InviteUserForm />
          {error ? (
            <div className="mt-8 text-center text-red-500">{error}</div>
          ) : (
            <UsersTable initialUsers={users} />
          )}
        </section>

        {/* Relatórios e Análises */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Relatórios e Análises</h2>
          <ReportsPanel />
        </section>

        {/* Gestão de Pedidos */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Pedidos</h2>
          <OrdersManagement />
        </section>

        {/* Gestão de Pagamentos */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Pagamentos</h2>
          <PaymentsManagement />
        </section>

        {/* Gestão de Estoque */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Estoque</h2>
          <InventoryManagement />
        </section>

        {/* Gestão de Categorias */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Categorias</h2>
          <CategoriesManagement />
        </section>

        {/* Gestão de Produtos */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Produtos</h2>
          <ProductsManagement />
        </section>

        {/* Gestão de Mesas */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Mesas</h2>
          <TablesManagement />
        </section>

        {/* Gestão de Clientes */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Clientes</h2>
          <CustomersManagement />
        </section>

        {/* Gestão de Áreas */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Áreas</h2>
          <AreasManagement />
        </section>

        {/* Configurações Gerais */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Configurações Gerais</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-gray-600">Aqui ficarão as configurações da loja, como nome, endereço, horários, etc.</p>
          </div>
        </section>
      </div>
    </div>
  );
}