'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Supplier, createSupplier, updateSupplier } from '@/lib/api';

const supplierSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional().or(z.literal('')),
    cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos').optional().or(z.literal('')),
    contactName: z.string().min(2, 'Nome do contato deve ter pelo menos 2 caracteres').optional().or(z.literal('')),
    address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').optional().or(z.literal('')),
    city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres').optional().or(z.literal('')),
    state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres').optional().or(z.literal('')),
    zipCode: z.string().min(5, 'CEP deve ter pelo menos 5 caracteres').optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
    supplier?: Supplier | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SupplierForm({ supplier, onClose, onSuccess }: SupplierFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: supplier ? {
            ...supplier,
            status: (supplier.status === 'ACTIVE' || supplier.status === 'INACTIVE') ? supplier.status : 'ACTIVE'
        } : {
            name: '',
            email: '',
            phone: '',
            cnpj: '',
            contactName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            notes: '',
            status: 'ACTIVE',
        },
    });

    useEffect(() => {
        if (supplier) {
            reset({
                ...supplier,
                status: (supplier.status === 'ACTIVE' || supplier.status === 'INACTIVE') ? supplier.status : 'ACTIVE'
            });
        }
    }, [supplier, reset]);

    const onSubmit = async (data: SupplierFormData) => {
        try {
            setIsSubmitting(true);
            setError(null);

            if (supplier) {
                await updateSupplier(supplier.id, data);
            } else {
                await createSupplier(data);
            }

            onSuccess();
        } catch (err) {
            setError('Erro ao salvar fornecedor. Tente novamente.');
            console.error('Erro ao salvar fornecedor:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome da Empresa *
                            </label>
                            <input
                                type="text"
                                {...register('name')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome da empresa"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="email@exemplo.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                {...register('phone')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="(11) 99999-9999"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CNPJ
                            </label>
                            <input
                                type="text"
                                {...register('cnpj')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="00.000.000/0000-00"
                            />
                            {errors.cnpj && (
                                <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Contato
                            </label>
                            <input
                                type="text"
                                {...register('contactName')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nome do contato principal"
                            />
                            {errors.contactName && (
                                <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                {...register('status')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ACTIVE">Ativo</option>
                                <option value="INACTIVE">Inativo</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço
                        </label>
                        <input
                            type="text"
                            {...register('address')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Endereço completo"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cidade
                            </label>
                            <input
                                type="text"
                                {...register('city')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Cidade"
                            />
                            {errors.city && (
                                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado
                            </label>
                            <input
                                type="text"
                                {...register('state')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Estado"
                            />
                            {errors.state && (
                                <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CEP
                            </label>
                            <input
                                type="text"
                                {...register('zipCode')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="00000-000"
                            />
                            {errors.zipCode && (
                                <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observações adicionais"
                        />
                        {errors.notes && (
                            <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Salvando...' : supplier ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
