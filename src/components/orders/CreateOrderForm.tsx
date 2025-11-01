'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMenuItems, getTables, createOrder, getCustomers, MenuItemResponse, TableResponse, OrderResponse, CustomerResponse, CreateOrderPayload } from '@/lib/api';
import { Portal } from '@/components/PortalRoot';
import { X, Plus, Trash2, User, XCircle, DollarSign, Table, Tag, Loader2 } from 'lucide-react';

const orderItemSchema = z.object({
    productId: z.string().uuid('Selecione um produto.'),
    quantity: z.preprocess((val) => parseInt(z.string().parse(val) || '1', 10), z.number().min(1, 'A quantidade deve ser pelo menos 1.')),
    notes: z.string().optional(),
});

const orderSchema = z.object({
    tableId: z.string().uuid('Selecione uma mesa.'),
    customerId: z.string().uuid().or(z.literal('')).optional(), // Para clientes de balcão não cadastrados
    customerName: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item ao pedido.'),
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']).default('PENDING'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    notes: z.string().optional(),
    discount: z.preprocess((val) => {
        if (val === null || val === undefined || val === '') {
            return 0;
        }
        const parsed = parseFloat(String(val).replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : 0;
    }, z.number().min(0).optional()),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface CreateOrderFormProps {
    onClose: () => void;
    onSave: (orderData: OrderResponse) => void;
}

export function CreateOrderForm({ onClose, onSave }: CreateOrderFormProps) {
    const [products, setProducts] = useState<MenuItemResponse[]>([]);
    const [tables, setTables] = useState<TableResponse[]>([]);
    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    const { control, register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            items: [],
            discount: 0,
            tableId: '',
            customerId: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    useEffect(() => {
        setMounted(true);
        async function fetchData() {
            try {
                const [prods, tbls, custs] = await Promise.all([
                    getMenuItems(),
                    getTables(),
                    getCustomers() // Busca clientes
                ]);
                setProducts(prods);
                setTables(tbls.filter(t => t.status === 'available')); // Filtrar apenas mesas disponíveis
                setCustomers(custs);
                if (prods.length === 0) {
                    setApiError('Não há produtos disponíveis para adicionar. Cadastre um produto antes de criar pedidos.');
                } else {
                    setApiError(null);
                }
            } catch (error) {
                setApiError('Falha ao carregar dados necessários para o formulário de pedido.');
                console.error('Erro ao buscar dados:', error);
                setProducts([]); // Garante que products seja um array vazio em caso de erro
                setTables([]);   // Garante que tables seja um array vazio em caso de erro
                setCustomers([]); // Garante que customers seja um array vazio em caso de erro
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (true) { // Modal é sempre considerado aberto para controle de ESC e scroll
            document.body.style.overflow = 'hidden';
            const handleEsc = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
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
    }, []); // Dependência vazia para rodar apenas uma vez na montagem

    const onSubmit: SubmitHandler<OrderFormData> = async (data) => {
        try {
            setApiError(null);
            const orderPayload: CreateOrderPayload = {
                channel: data.tableId ? 'table' : 'counter',
                numberOfPeople: Math.max(
                    1,
                    data.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0)
                ),
                tableId: data.tableId || undefined,
                customerId: data.customerId ? data.customerId : undefined,
                notes: data.notes,
                discount: Number.isFinite(discount) ? discount : 0,
                orderItems: data.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    const unitPrice = product ? (typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0)) : 0;
                    return {
                        productId: item.productId,
                        productName: product?.name ?? 'Produto',
                        productDescription: product?.description,
                        unitPrice,
                        quantity: item.quantity,
                        notes: item.notes,
                    };
                }),
            };

            const newOrder = await createOrder(orderPayload);
            onSave(newOrder);
            onClose();
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Ocorreu um erro ao criar o pedido.');
            console.error('Erro ao criar pedido:', err);
        }
    };

    const orderItems = watch('items');
    const subtotal = orderItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sum;
        const priceNumber = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0);
        return sum + priceNumber * item.quantity;
    }, 0);
    const discountValue = watch('discount');
    const parsedDiscount = typeof discountValue === 'number' ? discountValue : parseFloat(discountValue ?? '0');
    const discount = Number.isFinite(parsedDiscount) ? parsedDiscount : 0;
    const total = Math.max(0, subtotal - discount);

    if (!mounted) return null; // Prevenir renderização no SSR para Portal

    return (
        <Portal>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn"
            >
            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Novo Pedido</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} id="order-form" className="flex-1 flex flex-col">
                    <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-red-800">Erro:</h3>
                                    <p className="mt-1 text-sm text-red-700">{apiError}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="tableId" className="input-label">Mesa</label>
                                <div className="relative">
                                    <Table className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select {...register('tableId')} id="tableId" className="input-field pl-10">
                                        <option value="">Selecione uma mesa</option>
                                        {tables.map(t => <option key={t.id} value={t.id}>Mesa {t.name}</option>)}
                                    </select>
                                </div>
                                {errors.tableId && <p className="text-red-500 text-sm mt-1">{errors.tableId.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="customerId" className="input-label">Cliente</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select {...register('customerId')} id="customerId" className="input-field pl-10">
                                        <option value="">Balcão / Avulso</option>
                                        {(customers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Itens do Pedido</h3>
                                <button type="button" onClick={() => {
                                    const firstProduct = products[0];
                                    if (firstProduct) {
                                        append({ productId: firstProduct.id, quantity: 1, notes: '' });
                                        setApiError(null);
                                    } else {
                                        setApiError('Não há produtos disponíveis para adicionar.');
                                    }
                                }} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium text-sm px-3 py-2 rounded-md transition-colors duration-200">
                                    <Plus size={16} /> Adicionar item
                                </button>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <Controller
                                            control={control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <div className="relative flex-grow w-full">
                                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <select {...field} onChange={(e) => {
                                                        field.onChange(e);
                                                    }} className="input-field pl-10">
                                                        <option value="">Selecione um produto...</option>
                                                        {(products || []).map(p => {
                                                            const priceNumber = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price ?? 0);
                                                            return (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceNumber)}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            )}
                                        />
                                        <input type="number" {...register(`items.${index}.quantity`)} className="input-field w-24 text-center" />
                                        <span className="w-32 text-right font-semibold text-gray-800 shrink-0">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((() => {
                                                const product = products.find(p => p.id === orderItems[index]?.productId);
                                                if (!product) return 0;
                                                const priceNumber = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price ?? 0);
                                                return priceNumber * (orderItems[index]?.quantity || 0);
                                            })())}
                                        </span>
                                        <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:text-red-700 rounded-md transition-colors duration-200">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <textarea {...register(`items.${index}.notes`)} placeholder="Observações do item (ex: sem cebola, ponto da carne)..." rows={1} className="input-field text-sm" />
                                    {errors.items?.[index]?.productId && <p className="text-red-500 text-sm mt-1">{errors.items[index]?.productId?.message}</p>}
                                    {errors.items?.[index]?.quantity && <p className="text-red-500 text-sm mt-1">{errors.items[index]?.quantity?.message}</p>}
                                </div>
                            ))}
                            {errors.items && typeof errors.items.root?.message === 'string' && <p className="text-red-500 text-sm mt-1">{errors.items.root.message}</p>}
                        </div>

                        <div className="border-t border-gray-100 pt-5 space-y-4">
                            <div>
                                <label htmlFor="notes" className="input-label">Observações Gerais do Pedido</label>
                                <textarea {...register('notes')} id="notes" rows={2} className="input-field" placeholder="Adicione observações importantes para o pedido..." />
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <label htmlFor="discount" className="text-lg font-medium text-gray-700">Desconto</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                                    <input type="number" step="0.01" {...register('discount')} id="discount" className="input-field w-32 pl-9" />
                                </div>
                            </div>
                            <div className="font-bold text-2xl text-right text-indigo-700 mt-4">
                                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl -mx-6 -mb-6">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? (
                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...</>
                            ) : (
                                'Salvar Pedido'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </Portal>
    );
}
