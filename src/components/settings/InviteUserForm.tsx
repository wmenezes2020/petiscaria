
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { inviteUser, InviteUserRequest, UserRole } from '@/lib/api';

const roles: UserRole[] = ['Admin', 'Gerente', 'Garçom', 'Cozinha', 'Caixa'];

export function InviteUserForm() {
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
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Falha ao enviar o convite.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Convidar Novo Usuário</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        {...register('email', { required: 'Email é obrigatório' })} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                    <select 
                        id="role" 
                        {...register('role', { required: 'Função é obrigatória' })} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    >
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
                </div>
            </div>
            
            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <div className="text-right">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
                    {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
                </button>
            </div>
        </form>
    </div>
  );
}
