'use client';

import { useEffect, useMemo, useState } from 'react';
import { addItemsToTableCommand, CommandOrderResponse, MenuItemResponse, getMenuItems, CreateOrderPayload } from '@/lib/api';
import { Plus, Trash2, X, Loader2, ShoppingCart } from 'lucide-react';

interface AddItemsModalProps {
  isOpen: boolean;
  tableId: string;
  onClose: () => void;
  onItemsAdded: (order: CommandOrderResponse) => void;
}

interface NewItemRow {
  productId: string;
  quantity: number;
  notes: string;
}

export function AddItemsModal({ isOpen, tableId, onClose, onItemsAdded }: AddItemsModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [items, setItems] = useState<NewItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const products = await getMenuItems();
        setMenuItems(products);
        setItems((prev) => {
          if (prev.length > 0) {
            return prev;
          }
          const firstProductId = products[0]?.id ?? '';
          return [{ productId: firstProductId, quantity: 1, notes: '' }];
        });
      } catch (err) {
        console.error('Erro ao carregar produtos para itens da comanda:', err);
        setError('Não foi possível carregar produtos para adicionar.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [isOpen]);

  const handleAddRow = () => {
    const firstProductId = menuItems[0]?.id ?? '';
    setItems((prev) => [...prev, { productId: firstProductId, quantity: 1, notes: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof NewItemRow, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'quantity' ? Number(value) || 1 : value,
      };
      return next;
    });
  };

  const isDisabled = useMemo(() => {
    return isSubmitting || items.length === 0 || menuItems.length === 0;
  }, [isSubmitting, items.length, menuItems.length]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (items.length === 0) {
      setError('Adicione ao menos um item.');
      return;
    }

    const payloadItems: CreateOrderPayload['orderItems'] = items
      .filter((item) => item.productId)
      .map((item) => {
        const product = menuItems.find((p) => p.id === item.productId);
        const unitPrice = product ? Number(product.price ?? 0) : 0;

        return {
          productId: product?.id,
          productName: product?.name ?? 'Produto',
          productDescription: product?.description,
          unitPrice,
          quantity: item.quantity,
          discount: 0,
          tax: 0,
          notes: item.notes,
        };
      });

    if (payloadItems.length === 0) {
      setError('Selecione ao menos um produto válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const order = await addItemsToTableCommand(tableId, { items: payloadItems });
      onItemsAdded(order);
      onClose();
      setItems([{ productId: menuItems[0]?.id ?? '', quantity: 1, notes: '' }]);
    } catch (err: any) {
      console.error('Erro ao adicionar itens na comanda:', err);
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Não foi possível adicionar itens.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Adicionar itens à comanda</h3>
              <p className="text-sm text-gray-500">Selecione os produtos que serão adicionados a esta mesa.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <p className="ml-3 text-sm text-gray-600">Carregando produtos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`item-${index}`} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-3 md:items-center">
                      <div>
                        <label className="input-label">Produto</label>
                        <div className="relative">
                          <select
                            value={item.productId}
                            onChange={(event) => updateRow(index, 'productId', event.target.value)}
                            className="input-field"
                          >
                            {menuItems.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price ?? 0))}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="w-full md:w-28">
                        <label className="input-label">Quantidade</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => updateRow(index, 'quantity', Number(event.target.value) || 1)}
                          className="input-field"
                        />
                      </div>
                      <div className="flex justify-end md:justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="input-label">Observações</label>
                      <textarea
                        rows={2}
                        value={item.notes}
                        onChange={(event) => updateRow(index, 'notes', event.target.value)}
                        className="input-field"
                        placeholder="Observações específicas para este item (ex: sem gelo, ponto da carne)"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" /> Adicionar outro produto
                </button>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isDisabled} className="btn-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Salvando...
                </>
              ) : (
                'Adicionar Itens'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

