'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IngredientResponse, createIngredient, updateIngredient, getCategories, CategoryResponse } from '@/lib/api';
import { Loader2, Package, Tag, Hash, DollarSign, ClipboardList, ShoppingCart, FlaskConical, Barcode, Building2, XCircle } from 'lucide-react';

type IngredientFormModalProps = {
    ingredient?: IngredientResponse | null;
    onClose: () => void;
    onSuccess: () => void;
};

type IngredientFormData = {
    name: string;
    categoryId: string;
    ingredientType: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unitCost: number;
    unitPrice: number;
    sku: string;
    description: string;
    supplierName: string;
    brand: string;
    barcode: string;
};

const INGREDIENT_TYPES = [
    { value: 'raw_material', label: 'Matéria-prima' },
    { value: 'processed', label: 'Processado' },
    { value: 'spice', label: 'Tempero' },
    { value: 'condiment', label: 'Condimento' },
    { value: 'liquid', label: 'Líquido' },
    { value: 'dry', label: 'Seco' },
    { value: 'frozen', label: 'Congelado' },
    { value: 'fresh', label: 'Fresco' },
];

const INGREDIENT_UNITS = [
    { value: 'gram', label: 'Gramas (g)' },
    { value: 'kilogram', label: 'Quilos (kg)' },
    { value: 'milliliter', label: 'Mililitros (ml)' },
    { value: 'liter', label: 'Litros (L)' },
    { value: 'unit', label: 'Unidade' },
    { value: 'package', label: 'Pacote' },
    { value: 'bottle', label: 'Garrafa' },
    { value: 'can', label: 'Lata' },
];

export function IngredientFormModal({ ingredient, onClose, onSuccess }: IngredientFormModalProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [formData, setFormData] = useState<IngredientFormData>({
        name: ingredient?.name ?? '',
        categoryId: ingredient?.categoryId ?? '',
        ingredientType: ingredient?.ingredientType ?? 'raw_material',
        unit: ingredient?.unit ?? 'unit',
        currentStock: ingredient?.currentStock ?? 0,
        minStock: ingredient?.minStock ?? 0,
        maxStock: ingredient?.maxStock ?? 0,
        unitCost: ingredient?.unitCost ?? 0,
        unitPrice: ingredient?.unitPrice ?? 0,
        sku: ingredient?.sku ?? '',
        description: ingredient?.description ?? '',
        supplierName: ingredient?.supplierName ?? '',
        brand: ingredient?.brand ?? '',
        barcode: ingredient?.barcode ?? '',
    });

    useEffect(() => {
        setIsMounted(true);
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Erro ao carregar categorias:', err);
            }
        };
        fetchCategories();
    }, []);

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

    const updateField = <K extends keyof IngredientFormData>(field: K, value: IngredientFormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formData.name.trim()) {
            setError('Nome do insumo é obrigatório.');
            return;
        }
        if (!formData.categoryId) {
            setError('Selecione uma categoria.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                currentStock: Number(formData.currentStock ?? 0),
                minStock: Number(formData.minStock ?? 0),
                maxStock: Number(formData.maxStock ?? 0),
                unitCost: Number(formData.unitCost ?? 0),
                unitPrice: Number(formData.unitPrice ?? 0),
            };

            if (ingredient) {
                await updateIngredient(ingredient.id, payload);
            } else {
                await createIngredient(payload);
            }

            onSuccess();
        } catch (err: any) {
            console.error('Erro ao salvar insumo:', err);
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'Erro ao salvar insumo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {ingredient ? 'Editar Insumo' : 'Novo Insumo'}
                            </h3>
                            <p className="text-sm text-gray-500">Cadastre ou atualize um insumo para controlar seu estoque.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
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
                                <label className="input-label">Nome do Insumo *</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Ex: Queijo mussarela"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Categoria *</label>
                                <div className="relative">
                                    <ClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => updateField('categoryId', e.target.value)}
                                        className="input-field pl-10"
                                        required
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {(categories || []).map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="input-label">Tipo de Insumo</label>
                                <div className="relative">
                                    <FlaskConical className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={formData.ingredientType}
                                        onChange={(e) => updateField('ingredientType', e.target.value)}
                                        className="input-field pl-10"
                                    >
                                        {INGREDIENT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Unidade</label>
                                <div className="relative">
                                    <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => updateField('unit', e.target.value)}
                                        className="input-field pl-10"
                                    >
                                        {INGREDIENT_UNITS.map((unit) => (
                                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="input-label">SKU / Código interno</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => updateField('sku', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="input-label">Estoque Atual</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.currentStock}
                                        onChange={(e) => updateField('currentStock', Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Estoque Mínimo</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.minStock}
                                        onChange={(e) => updateField('minStock', Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Estoque Máximo</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.maxStock}
                                        onChange={(e) => updateField('maxStock', Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="input-label">Custo Unitário (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.unitCost}
                                        onChange={(e) => updateField('unitCost', Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Preço de Venda (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.unitPrice}
                                        onChange={(e) => updateField('unitPrice', Number(e.target.value) || 0)}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="input-label">Fornecedor</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.supplierName}
                                        onChange={(e) => updateField('supplierName', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Marca</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => updateField('brand', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Código de Barras</label>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => updateField('barcode', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Descrição</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={3}
                                className="input-field"
                                placeholder="Detalhes adicionais, condições de armazenamento, alergênicos..."
                            />
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
                            ) : (
                                ingredient ? 'Atualizar Insumo' : 'Criar Insumo'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}


