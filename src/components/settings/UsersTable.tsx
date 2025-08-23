
'use client';

import { useState } from 'react';
import { UserResponse } from '@/lib/api';
import { MoreVertical } from 'lucide-react';

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
        <h3 className="text-lg font-semibold mb-4">Usuários Ativos</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Nome</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Função</th>
                <th scope="col" className="px-6 py-3">Último Acesso</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900">
                        {user.name}
                    </th>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4 text-right">
                        <button className="text-gray-500 hover:text-gray-800">
                            <MoreVertical size={18} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
}
