'use client';

import { useState, useEffect } from 'react';
import { Users, PlusCircle, Mail, Search, Shield, XCircle, UserCheck } from 'lucide-react';
import { getUsers, UserResponse } from '@/lib/api';
import { InviteUserForm } from './InviteUserForm';
import { createPortal } from 'react-dom';

export function UsersManagement() {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);

    const handleOpenInviteForm = () => setIsInviteFormOpen(true);
    const handleCloseInviteForm = () => setIsInviteFormOpen(false);

    useEffect(() => {
        if (isInviteFormOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    handleCloseInviteForm();
                }
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                window.removeEventListener('keydown', handleEsc);
                document.body.style.overflow = '';
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isInviteFormOpen]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const fetchedUsers = await getUsers();
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
        } catch (e) {
            console.error('Failed to fetch users:', e);
            setError('Não foi possível carregar a lista de usuários.');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h3>
                    <p className="text-sm text-gray-600">Gerencie usuários e permissões do sistema</p>
                </div>
                <button 
                    onClick={handleOpenInviteForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition"
                >
                    <PlusCircle className="h-4 w-4" />
                    Novo Usuário
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Convite de usuário */}
            {/* Removido o InviteUserForm direto, agora será um modal */}

            {/* Tabela de usuários */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                        {!searchTerm && (
                            <p className="text-sm text-gray-400">Convide seu primeiro usuário para começar a gerenciar.</p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Função</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition relative group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="ml-3 text-sm font-medium text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                <Shield className="h-3 w-3 mr-1" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Ativo
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button className="text-indigo-600 hover:text-indigo-800 p-1 transition">Editar</button>
                                                <button className="text-red-600 hover:text-red-800 p-1 transition">Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invite User Modal */}
            {isInviteFormOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Convidar Novo Usuário</h3>
                            <button onClick={handleCloseInviteForm} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <InviteUserForm onUserInvited={() => { fetchUsers(); handleCloseInviteForm(); }} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

