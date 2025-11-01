
'use client';

import { useState } from 'react';
import { UserResponse } from '@/lib/api';
import { MoreVertical, Users } from 'lucide-react';

interface UsersTableProps {
  initialUsers: UserResponse[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (users.length === 0) {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center justify-center mt-8">
            <Users className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700 mb-2">Nenhum usuário encontrado</p>
            <p className="text-sm text-gray-500">Convide novos usuários para gerenciar seu estabelecimento.</p>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mt-8">
        <h3 className="text-xl font-bold text-gray-900 px-6 pt-5">Usuários Ativos</h3>
        <div className="overflow-x-auto rounded-b-2xl">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs font-semibold uppercase text-gray-600 tracking-wider bg-gray-100/50 rounded-t-2xl">
                <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Função</th>
                <th scope="col" className="px-6 py-3">Último Acesso</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                <tr key={user.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 relative group">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {user.name}
                    </th>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className="px-3 py-1 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                            <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
}
