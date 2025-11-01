
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { inviteUser, InviteUserRequest, UserRole } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

const roles: UserRole[] = ['Admin', 'Gerente', 'Garçom', 'Cozinha', 'Caixa'];

interface InviteUserFormProps {
    onUserInvited?: () => void;
}

export function InviteUserForm({ onUserInvited }: InviteUserFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InviteUserRequest>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<InviteUserRequest> = async (data) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await inviteUser(data);
      setSuccessMessage(`Convite enviado com sucesso para ${data.email}!`);
      reset();
      onUserInvited?.(); // Chama a função para recarregar a lista de usuários
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Falha ao enviar o convite.');
    }
  };

  return (
    <div className="p-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        {...register('email', { required: 'Email é obrigatório' })} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="email@exemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                    <select 
                        id="role" 
                        {...register('role', { required: 'Função é obrigatória' })} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
                </div>
            </div>
            
            {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">Erro: {serverError}</p>
                    </div>
                </div>
            )}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
                </button>
            </div>
        </form>
    </div>
  );
}
