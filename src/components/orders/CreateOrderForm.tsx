'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getMenuItems, getTables, createOrder, getCustomers, MenuItemResponse, TableResponse, OrderResponse, CustomerResponse } from '@/lib/api';
import { X, Plus, Trash2, UserSearch } from 'lucide-react';

const orderItemSchema = z.object({
    productId: z.string().uuid('Selecione um produto.'),
    quantity: z.preprocess((val) => parseInt(z.string().parse(val) || '1', 10), z.number().min(1, 'A quantidade deve ser pelo menos 1.')),
    unitPrice: z.number(),
    productName: z.string(),
    notes: z.string().optional(),
});

const orderSchema = z.object({
    tableId: z.string().uuid().optional().nullable(),
    customerId: z.string().uuid().optional().nullable(),
    customerName: z.string().optional(), // Para clientes de balcão não cadastrados
    orderItems: z.array(orderItemSchema).min(1, 'Adicione pelo menos um item ao pedido.'),
    notes: z.string().optional(),
    discount: z.preprocess((val) => parseFloat(z.string().parse(val) || '0'), z.number().min(0).optional()),
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

    const { control, register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            orderItems: [],
            discount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "orderItems"
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [prods, tbls, custs] = await Promise.all([
                    getMenuItems(),
                    getTables(),
                    getCustomers({ limit: 100 }) // Busca clientes
                ]);
                setProducts(prods);
                setTables(tbls.filter(t => t.status === 'available'));
                setCustomers(custs.customers);
            } catch (error) {
                setApiError('Falha ao carregar dados necessários.');
            }
        }
        fetchData();
    }, []);

    const onSubmit: SubmitHandler<OrderFormData> = async (data) => {
        try {
            setApiError(null);
            const newOrder = await createOrder(data);
            onSave(newOrder);
            onClose();
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Ocorreu um erro ao criar o pedido.');
        }
    };

    const orderItems = watch('orderItems');
    const subtotal = orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discount = watch('discount') || 0;
    const total = subtotal - discount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 p-4 pt-10">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit(onSubmit)} id="order-form">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">Novo Pedido</h2>
                        <button type="button" onClick={onClose}><X size={24} /></button>
                    </div>
                    <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tableId" className="block text-sm font-medium text-gray-700">Mesa</label>
                                <select {...register('tableId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">Nenhuma</option>
                                    {tables.map(t => <option key={t.id} value={t.id}>Mesa {t.number}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select {...register('customerId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">Balcão / Avulso</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Itens</h3>
                                <button type="button" onClick={() => {
                                    const firstProduct = products[0];
                                    if (firstProduct) {
                                        append({ productId: firstProduct.id, quantity: 1, unitPrice: firstProduct.price, productName: firstProduct.name });
                                    }
                                }} className="text-sm text-blue-600 flex items-center"><Plus size={16} className="mr-1" /> Adicionar item</button>
                            </div>
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-gray-50 p-3 rounded-lg mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Controller
                                            control={control}
                                            name={`orderItems.${index}.productId`}
                                            render={({ field }) => (
                                                <select {...field} onChange={(e) => {
                                                    const product = products.find(p => p.id === e.target.value);
                                                    setValue(`orderItems.${index}.unitPrice`, product?.price || 0);
                                                    setValue(`orderItems.${index}.productName`, product?.name || '');
                                                    field.onChange(e);
                                                }} className="flex-grow block w-full rounded-md border-gray-300 shadow-sm">
                                                    <option value="">Selecione um produto...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            )}
                                        />
                                        <input type="number" {...register(`orderItems.${index}.quantity`)} defaultValue={1} className="w-20 block rounded-md border-gray-300 shadow-sm" />
                                        <span className="w-24 text-right pr-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderItems[index]?.unitPrice * orderItems[index]?.quantity || 0)}</span>
                                        <button type="button" onClick={() => remove(index)}><Trash2 size={18} className="text-red-500" /></button>
                                    </div>
                                    <textarea {...register(`orderItems.${index}.notes`)} placeholder="Observações do item..." rows={1} className="mt-2 w-full text-sm rounded-md border-gray-300 shadow-sm" />
                                </div>
                            ))}
                            {errors.orderItems && <p className="text-red-500 text-xs mt-1">{errors.orderItems.message || errors.orderItems.root?.message}</p>}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações Gerais do Pedido</label>
                                <textarea {...register('notes')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="flex justify-end items-center space-x-4">
                                <label htmlFor="discount" className="text-sm font-medium text-gray-700">Desconto (R$)</label>
                                <input type="number" step="0.01" {...register('discount')} className="w-28 block rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="font-bold text-lg text-right">
                                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
