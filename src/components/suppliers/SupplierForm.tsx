'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Supplier, createSupplier, updateSupplier } from '@/lib/api';
import { createPortal } from 'react-dom';
import { X, Building2, Mail, Phone, CreditCard, User, CheckCircle, Home, MapPin, Globe, Map, XCircle, Loader2, Save, PlusCircle } from 'lucide-react';

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

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                        {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                    <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="name" className="input-label">
                                    Nome da Empresa *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('name')}
                                        id="name"
                                        className="input-field pl-10"
                                        placeholder="Nome da empresa"
                                        autoFocus
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="input-label">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        {...register('email')}
                                        id="email"
                                        className="input-field pl-10"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="input-label">
                                    Telefone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        id="phone"
                                        className="input-field pl-10"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="cnpj" className="input-label">
                                    CNPJ
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('cnpj')}
                                        id="cnpj"
                                        className="input-field pl-10"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>
                                {errors.cnpj && (
                                    <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="contactName" className="input-label">
                                    Nome do Contato
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('contactName')}
                                        id="contactName"
                                        className="input-field pl-10"
                                        placeholder="Nome do contato principal"
                                    />
                                </div>
                                {errors.contactName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="status" className="input-label">
                                    Status
                                </label>
                                <div className="relative">
                                    <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        {...register('status')}
                                        id="status"
                                        className="input-field pl-10"
                                    >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                    </select>
                                </div>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="address" className="input-label">
                                Endereço
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    {...register('address')}
                                    id="address"
                                    className="input-field pl-10"
                                    placeholder="Endereço completo"
                                />
                            </div>
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label htmlFor="city" className="input-label">
                                    Cidade
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('city')}
                                        id="city"
                                        className="input-field pl-10"
                                        placeholder="Cidade"
                                    />
                                </div>
                                {errors.city && (
                                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="state" className="input-label">
                                    Estado
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('state')}
                                        id="state"
                                        className="input-field pl-10"
                                        placeholder="Estado"
                                    />
                                </div>
                                {errors.state && (
                                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="zipCode" className="input-label">
                                    CEP
                                </label>
                                <div className="relative">
                                    <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        {...register('zipCode')}
                                        id="zipCode"
                                        className="input-field pl-10"
                                        placeholder="00000-000"
                                    />
                                </div>
                                {errors.zipCode && (
                                    <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="input-label">
                                Observações
                            </label>
                            <textarea
                                {...register('notes')}
                                id="notes"
                                rows={3}
                                className="input-field"
                                placeholder="Observações adicionais"
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl -mx-6 -mb-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...</>
                            ) : supplier ? (
                                <><Save className="h-5 w-5 mr-2" /> Atualizar</>
                            ) : (
                                <><PlusCircle className="h-5 w-5 mr-2" /> Criar</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
