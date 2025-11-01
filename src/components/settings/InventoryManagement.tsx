'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    Search,
    PlusCircle,
    ClipboardList,
    RefreshCcw,
    XCircle,
    Loader2,
    ArrowUpCircle,
    ArrowDownCircle,
    Table2,
    Hash
} from 'lucide-react';
import { createPortal } from 'react-dom';
import {
    IngredientResponse,
    getIngredients,
    updateIngredient
} from '@/lib/api';
import { IngredientFormModal } from '@/components/stock/IngredientFormModal';

type StockStatus = 'OUT' | 'LOW' | 'NORMAL' | 'HIGH';

interface QuickAdjustState {
    ingredientId: string;
    operation: 'add' | 'subtract' | 'set';
    quantity: number;
    notes: string;
}

export function InventoryManagement() {
    const router = useRouter();

    const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<IngredientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState<'ALL' | StockStatus>('ALL');

    const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
    const [ingredientBeingEdited, setIngredientBeingEdited] = useState<IngredientResponse | null>(null);

    const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState(false);
    const [quickAdjustState, setQuickAdjustState] = useState<QuickAdjustState>({
        ingredientId: '',
        operation: 'add',
        quantity: 0,
        notes: ''
    });
    const [quickAdjustError, setQuickAdjustError] = useState<string | null>(null);
    const [isAdjusting, setIsAdjusting] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    useEffect(() => {
        setFilteredIngredients(applyFilters(ingredients, searchTerm, stockFilter));
    }, [ingredients, searchTerm, stockFilter]);

    useEffect(() => {
        if (!isQuickAdjustOpen) {
            return;
        }
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeQuickAdjust();
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isQuickAdjustOpen]);

    const fetchIngredients = async () => {
        try {
            setIsLoading(true);
            const response = await getIngredients();
            const list = Array.isArray(response) ? response : [];
            setIngredients(list);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar ingredientes:', err);
            setError('Não foi possível carregar os insumos. Tente novamente em instantes.');
            setIngredients([]);
        } finally {
            setIsLoading(false);
        }
    };

    const stockMetrics = useMemo(() => calculateStockMetrics(ingredients), [ingredients]);

    const openIngredientModal = (ingredient?: IngredientResponse | null) => {
        setIngredientBeingEdited(ingredient ?? null);
        setIsIngredientModalOpen(true);
    };

    const closeIngredientModal = () => {
        setIngredientBeingEdited(null);
        setIsIngredientModalOpen(false);
    };

    const openQuickAdjust = (ingredient?: IngredientResponse) => {
        const defaultId = ingredient?.id ?? (ingredients.length > 0 ? ingredients[0].id : '');
        setQuickAdjustState({
            ingredientId: defaultId,
            operation: 'add',
            quantity: 0,
            notes: ''
        });
        setQuickAdjustError(null);
        setIsQuickAdjustOpen(true);
    };

    const closeQuickAdjust = () => {
        setIsQuickAdjustOpen(false);
        setQuickAdjustState({ ingredientId: '', operation: 'add', quantity: 0, notes: '' });
        setQuickAdjustError(null);
    };

    const handleQuickAdjustSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!quickAdjustState.ingredientId) {
            setQuickAdjustError('Selecione o insumo que deseja ajustar.');
            return;
        }

        const ingredient = ingredients.find((item) => item.id === quickAdjustState.ingredientId);
        if (!ingredient) {
            setQuickAdjustError('Insumo não encontrado.');
            return;
        }

        const quantity = Number(quickAdjustState.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            setQuickAdjustError('Informe uma quantidade válida maior que zero.');
            return;
        }

        const currentStock = Number(ingredient.currentStock ?? 0);
        let newStock = currentStock;

        if (quickAdjustState.operation === 'add') {
            newStock = currentStock + quantity;
        } else if (quickAdjustState.operation === 'subtract') {
            if (quantity > currentStock) {
                setQuickAdjustError('A quantidade informada é maior que o estoque atual.');
                return;
            }
            newStock = currentStock - quantity;
        } else {
            newStock = quantity;
        }

        setIsAdjusting(true);
        setQuickAdjustError(null);

        try {
            await updateIngredient(ingredient.id, { currentStock: Number(newStock.toFixed(2)) });
            await fetchIngredients();
            closeQuickAdjust();
        } catch (err) {
            console.error('Erro ao ajustar estoque:', err);
            setQuickAdjustError('Não foi possível aplicar o ajuste agora.');
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleNavigateToPurchases = () => {
        router.push('/app/estoque/compras');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8 rounded-2xl shadow-lg border border-gray-100 bg-white min-h-[300px]">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="card p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glow">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Controle de Estoque</h3>
                        <p className="text-sm text-gray-500">Gerencie insumos, acompanhe níveis e registre compras com praticidade.</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                        type="button"
                        onClick={() => openQuickAdjust()}
                        disabled={ingredients.length === 0}
                        className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw className="h-5 w-5 mr-2" /> Ajuste Rápido
                    </button>
                    <button
                        type="button"
                        onClick={handleNavigateToPurchases}
                        className="btn-secondary"
                    >
                        <ClipboardList className="h-5 w-5 mr-2" /> Registrar Compra
                    </button>
                    <button
                        type="button"
                        onClick={() => openIngredientModal(null)}
                        className="btn-primary"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Insumo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="input-field pl-10"
                        placeholder="Buscar insumos por nome, descrição ou fornecedor..."
                    />
                </div>
                <select
                    value={stockFilter}
                    onChange={(event) => setStockFilter(event.target.value as 'ALL' | StockStatus)}
                    className="input-field"
                >
                    <option value="ALL">Todos os status</option>
                    <option value="OUT">Sem estoque</option>
                    <option value="LOW">Estoque baixo</option>
                    <option value="NORMAL">Estoque saudável</option>
                    <option value="HIGH">Estoque alto</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">Erro ao carregar insumos</h3>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={fetchIngredients} className="text-sm font-semibold text-red-600 hover:text-red-800">
                        Tentar novamente
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
                    title="Sem estoque"
                    value={stockMetrics.outOfStock}
                    accent="bg-red-100"
                />
                <MetricCard
                    icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
                    title="Estoque baixo"
                    value={stockMetrics.lowStock}
                    accent="bg-yellow-100"
                />
                <MetricCard
                    icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                    title="Estoque saudável"
                    value={stockMetrics.normalStock}
                    accent="bg-green-100"
                />
                <MetricCard
                    icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
                    title="Estoque alto"
                    value={stockMetrics.highStock}
                    accent="bg-blue-100"
                />
                </div>

            <div className="card p-0">
                <ul className="divide-y divide-gray-100">
                    {(filteredIngredients?.length ?? 0) === 0 ? (
                        <li className="px-6 py-12 text-center text-gray-500 space-y-3">
                            <Package className="h-16 w-16 mx-auto text-gray-300" />
                            <p className="text-lg font-semibold text-gray-600">Nenhum insumo encontrado</p>
                            <p className="text-sm text-gray-400">
                                {searchTerm || stockFilter !== 'ALL'
                                    ? 'Ajuste os filtros ou limpe a busca para visualizar outros resultados.'
                                    : 'Cadastre seus primeiros insumos para começar a controlar o estoque.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => openIngredientModal(null)}
                                className="btn-primary inline-flex items-center mx-auto"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" /> Novo Insumo
                            </button>
                        </li>
                    ) : (
                        filteredIngredients.map((ingredient) => {
                            const status = getStockStatus(ingredient);
                            return (
                                <li
                                    key={ingredient.id}
                                    className="relative group px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                            <Package className="h-6 w-6 text-indigo-600" />
                                                </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-lg font-semibold text-gray-900">{ingredient.name}</h4>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${status.badgeClasses}`}>
                                                    {status.text}
                                                    </span>
                                                {ingredient.unit && (
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                        {ingredient.unit}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <StockInfo
                                                    icon={<Package className="h-4 w-4 text-gray-400" />}
                                                    label="Atual"
                                                    value={formatNumber(ingredient.currentStock)}
                                                    suffix={ingredient.unit}
                                                />
                                                <StockInfo
                                                    icon={<ArrowDownCircle className="h-4 w-4 text-yellow-500" />}
                                                    label="Mínimo"
                                                    value={formatNumber(ingredient.minStock)}
                                                    suffix={ingredient.unit}
                                                />
                                                <StockInfo
                                                    icon={<ArrowUpCircle className="h-4 w-4 text-blue-500" />}
                                                    label="Máximo"
                                                    value={formatNumber(ingredient.maxStock)}
                                                    suffix={ingredient.unit}
                                                />
                                                {ingredient.supplierName && (
                                                    <StockInfo
                                                        icon={<Table2 className="h-4 w-4 text-gray-400" />}
                                                        label="Fornecedor"
                                                        value={ingredient.supplierName}
                                                    />
                                                )}
                                            </div>
                                            {ingredient.description && (
                                                <p className="mt-2 text-sm text-gray-500 line-clamp-1">{ingredient.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            type="button"
                                            onClick={() => openQuickAdjust(ingredient)}
                                            className="p-2 text-primary-600 hover:text-primary-800 rounded-full hover:bg-primary-50"
                                            title="Ajuste rápido"
                                        >
                                            <RefreshCcw className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openIngredientModal(ingredient)}
                                            className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50"
                                            title="Editar insumo"
                                        >
                                            <Hash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>

            {isIngredientModalOpen && (
                <IngredientFormModal
                    ingredient={ingredientBeingEdited ?? undefined}
                    onClose={closeIngredientModal}
                    onSuccess={async () => {
                        closeIngredientModal();
                        await fetchIngredients();
                    }}
                />
            )}

            {isQuickAdjustOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <RefreshCcw className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Ajuste rápido de estoque</h3>
                                    <p className="text-sm text-gray-500">Atualize a quantidade disponível de um insumo em segundos.</p>
                                </div>
                            </div>
                            <button onClick={closeQuickAdjust} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleQuickAdjustSubmit} className="flex-1 flex flex-col">
                            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                                {quickAdjustError && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-red-800">Erro</h3>
                                            <p className="text-sm text-red-700 mt-1">{quickAdjustError}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="input-label">Selecione o insumo *</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            value={quickAdjustState.ingredientId}
                                            onChange={(event) => setQuickAdjustState((prev) => ({ ...prev, ingredientId: event.target.value }))}
                                            className="input-field pl-10"
                                            required
                                        >
                                            <option value="">Selecione um insumo</option>
                                            {ingredients.map((ingredient) => (
                                                <option key={ingredient.id} value={ingredient.id}>
                                                    {ingredient.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="input-label">Tipo de operação *</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <select
                                                value={quickAdjustState.operation}
                                                onChange={(event) => setQuickAdjustState((prev) => ({ ...prev, operation: event.target.value as QuickAdjustState['operation'] }))}
                                                className="input-field pl-10"
                                            >
                                                <option value="add">Entrada (somar)</option>
                                                <option value="subtract">Saída (subtrair)</option>
                                                <option value="set">Definir quantidade</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="input-label">Quantidade *</label>
                                        <div className="relative">
                                            <ArrowUpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            min="0"
                                                step="0.01"
                                                value={quickAdjustState.quantity}
                                                onChange={(event) => setQuickAdjustState((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
                                                className="input-field pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Observações (opcional)</label>
                                    <textarea
                                        value={quickAdjustState.notes}
                                        onChange={(event) => setQuickAdjustState((prev) => ({ ...prev, notes: event.target.value }))}
                                        rows={3}
                                        className="input-field"
                                        placeholder="Descreva o motivo do ajuste ou referência da compra."
                                    />
                                </div>
                                </div>

                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl -mx-6 -mb-6">
                                <button type="button" onClick={closeQuickAdjust} className="btn-secondary">
                                        Cancelar
                                    </button>
                                <button type="submit" disabled={isAdjusting} className="btn-primary">
                                    {isAdjusting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...
                                        </>
                                    ) : (
                                        'Aplicar ajuste'
                                    )}
                                    </button>
                                </div>
                            </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

function MetricCard({ icon, title, value, accent }: { icon: ReactNode; title: string; value: number; accent: string }) {
    return (
        <div className={`bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 ${accent}`}>
            <div className="p-3 bg-white rounded-full shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function StockInfo({ icon, label, value, suffix }: { icon: ReactNode; label: string; value?: string | number; suffix?: string }) {
    return (
        <span className="flex items-center gap-1">
            {icon}
            <span className="text-gray-400">{label}:</span>
            <span className="font-semibold text-gray-700">
                {value ?? '-'}
                {suffix ? ` ${suffix}` : ''}
            </span>
        </span>
    );
}

function applyFilters(items: IngredientResponse[], searchTerm: string, stockFilter: 'ALL' | StockStatus) {
    let filtered = Array.isArray(items) ? [...items] : [];

    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((ingredient) => {
            return (
                ingredient.name?.toLowerCase().includes(term) ||
                ingredient.description?.toLowerCase().includes(term) ||
                ingredient.supplierName?.toLowerCase().includes(term)
            );
        });
    }

    if (stockFilter !== 'ALL') {
        filtered = filtered.filter((ingredient) => getStockStatus(ingredient).status === stockFilter);
    }

    return filtered;
}

function calculateStockMetrics(items: IngredientResponse[]) {
    let outOfStock = 0;
    let lowStock = 0;
    let highStock = 0;

    items.forEach((ingredient) => {
        const status = getStockStatus(ingredient).status;
        if (status === 'OUT') {
            outOfStock += 1;
        } else if (status === 'LOW') {
            lowStock += 1;
        } else if (status === 'HIGH') {
            highStock += 1;
        }
    });

    const normalStock = Math.max(items.length - (outOfStock + lowStock + highStock), 0);

    return { outOfStock, lowStock, highStock, normalStock };
}

function getStockStatus(ingredient: IngredientResponse) {
    const current = Number(ingredient.currentStock ?? 0);
    const min = Number(ingredient.minStock ?? 0);
    const max = Number(ingredient.maxStock ?? 0);

    if (current <= 0) {
        return {
            status: 'OUT' as StockStatus,
            text: 'Sem estoque',
            badgeClasses: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20'
        };
    }

    if (min > 0 && current <= min) {
        return {
            status: 'LOW' as StockStatus,
            text: 'Estoque baixo',
            badgeClasses: 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
        };
    }

    if (max > 0 && current >= max) {
        return {
            status: 'HIGH' as StockStatus,
            text: 'Estoque alto',
            badgeClasses: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-600/20'
        };
    }

    return {
        status: 'NORMAL' as StockStatus,
        text: 'Estoque saudável',
        badgeClasses: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20'
    };
}

function formatNumber(value?: number | null) {
    if (value === undefined || value === null) {
        return '-';
    }
    return Number(value).toLocaleString('pt-BR', {
        minimumFractionDigits: value % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
    });
}

