'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useRequireGuest } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
    companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
    cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { register: registerUser, error, clearError } = useAuthStore();

    // Verificar se já está autenticado
    const { isLoading: authLoading } = useRequireGuest();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            clearError();

            // Remover campos desnecessários
            const { confirmPassword, ...registerData } = data;

            await registerUser(registerData);

            toast.success('Cadastro realizado com sucesso!');

            // Aguardar um tick para garantir que o estado foi atualizado
            setTimeout(() => {
                router.push('/app/dashboard');
            }, 100);

        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer cadastro');
        } finally {
            setIsLoading(false);
        }
    };

    // Se estiver carregando a autenticação, mostrar loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Image
                        src="/images/logo.png"
                        alt="Petiscaria da Thay"
                        width={120}
                        height={120}
                        className="mx-auto mb-4"
                    />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Criar Conta
                    </h2>
                    <p className="text-gray-600">
                        Comece sua jornada com a Petiscaria da Thay
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Informações Pessoais */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-orange-600" />
                            Informações Pessoais
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome Completo
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    id="name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Seu nome completo"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        {...register('email')}
                                        type="email"
                                        id="email"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        {...register('confirmPassword')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Confirme sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informações da Empresa */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-orange-600" />
                            Informações da Empresa
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome da Empresa
                                </label>
                                <input
                                    {...register('companyName')}
                                    type="text"
                                    id="companyName"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Nome do seu estabelecimento"
                                />
                                {errors.companyName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                                    CNPJ
                                </label>
                                <input
                                    {...register('cnpj')}
                                    type="text"
                                    id="cnpj"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="00.000.000/0000-00"
                                />
                                {errors.cnpj && (
                                    <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone (Opcional)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        id="phone"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço (Opcional)
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        {...register('address')}
                                        type="text"
                                        id="address"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Rua, número, bairro"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade
                                    </label>
                                    <input
                                        {...register('city')}
                                        type="text"
                                        id="city"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Sua cidade"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <input
                                        {...register('state')}
                                        type="text"
                                        id="state"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    CEP (Opcional)
                                </label>
                                <input
                                    {...register('zipCode')}
                                    type="text"
                                    id="zipCode"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="00000-000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botão de Cadastro */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>

                    {/* Link para Login */}
                    <div className="text-center">
                        <p className="text-gray-600">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Mensagem de Erro */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
