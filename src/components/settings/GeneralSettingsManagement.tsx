'use client';

import { Settings, Store, MapPin, Clock, Bell, Shield } from 'lucide-react';
import { Building2, Home, Mail, Phone, Globe, Map, XCircle } from 'lucide-react';

export function GeneralSettingsManagement() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card p-6 flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Configurações Gerais</h2>
                    <p className="text-gray-500 mt-1">Ajuste as configurações básicas e operacionais do seu negócio</p>
                </div>
            </div>

            {/* Seções de configuração */}
            <div className="space-y-6">
                {/* Informações da loja */}
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Store className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Informações do Estabelecimento</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="businessName" className="input-label">Nome do Estabelecimento</label>
                            <input
                                type="text"
                                id="businessName"
                                placeholder="Petiscaria da Thay"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="input-label">Endereço</label>
                            <input
                                type="text"
                                id="address"
                                placeholder="Rua Exemplo, 123"
                                className="input-field"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="city" className="input-label">Cidade</label>
                                <input
                                    type="text"
                                    id="city"
                                    placeholder="São Paulo"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="input-label">Estado</label>
                                <input
                                    type="text"
                                    id="state"
                                    placeholder="SP"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary mt-6">
                        Salvar Alterações
                    </button>
                </div>

                {/* Configurações de horário */}
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
                    </div>

                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium text-gray-600">Configuração de horários em desenvolvimento</p>
                        <p className="text-sm text-gray-500 mt-1">Esta funcionalidade estará disponível em breve</p>
                    </div>
                </div>

                {/* Notificações */}
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Bell className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                    </div>

                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium text-gray-600">Configuração de notificações em desenvolvimento</p>
                        <p className="text-sm text-gray-500 mt-1">Esta funcionalidade estará disponível em breve</p>
                    </div>
                </div>

                {/* Segurança */}
                <div className="card p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
                    </div>

                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                        <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium text-gray-600">Configurações de segurança em desenvolvimento</p>
                        <p className="text-sm text-gray-500 mt-1">Esta funcionalidade estará disponível em breve</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

