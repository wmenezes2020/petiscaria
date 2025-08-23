import { getUsers, UserResponse } from '@/lib/api';
import { InviteUserForm } from '@/components/settings/InviteUserForm';
import { UsersTable } from '@/components/settings/UsersTable';

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
      
      {/* We can add a tabbed interface here later for General, Payments, etc. */}
      <div className="space-y-10">
        <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestão de Usuários</h2>
            <InviteUserForm />
            {error ? (
                <div className="mt-8 text-center text-red-500">{error}</div>
            ) : (
                <UsersTable initialUsers={users} />
            )}
        </section>

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