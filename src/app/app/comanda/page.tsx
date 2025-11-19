'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ShoppingCart, X } from 'lucide-react';
import type { Order, Product, Table } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

async function fetchOrders(): Promise<Order[]> {
  const response = await api.get<{ orders?: Order[]; data?: Order[] }>('/orders');
  return response.orders || response.data || [];
}

async function fetchProducts(): Promise<Product[]> {
  const response = await api.get<{ products?: Product[]; data?: Product[] }>('/products');
  return response.products || response.data || [];
}

async function fetchTables(): Promise<Table[]> {
  const response = await api.get<{ tables?: Table[]; data?: Table[] }>('/tables');
  return response.tables || response.data || [];
}

export default function ComandaPage() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      channel: 'mesa' | 'balcao' | 'delivery' | 'retirada';
      tableId?: string;
      numberOfPeople: number;
      orderItems: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
      }>;
    }) => {
      return api.post('/orders', orderData);
    },
    onSuccess: () => {
      toast.success('Pedido criado com sucesso!');
      setSelectedProducts([]);
      setSelectedTable('');
      setNumberOfPeople(1);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Erro ao criar pedido');
    },
  });

  const addProduct = (product: Product) => {
    const existing = selectedProducts.find((p) => p.product.id === product.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.product.id === productId ? { ...p, quantity } : p
      )
    );
  };

  const subtotal = selectedProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCreateOrder = () => {
    if (!selectedTable) {
      toast.error('Selecione uma mesa');
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    const orderItems = selectedProducts.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    createOrderMutation.mutate({
      channel: 'mesa',
      tableId: selectedTable,
      numberOfPeople,
      orderItems,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comanda Digital</h1>
        <p className="text-muted-foreground">Criar e gerenciar pedidos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {products?.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addProduct(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        <Button size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mesa *</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables?.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.number} - {table.status === 'available' ? 'Livre' : table.status === 'occupied' ? 'Ocupada' : table.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Número de Pessoas</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{numberOfPeople}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Itens</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedProducts.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.price)} x {item.quantity} = {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.product.id, item.quantity - 1);
                          }}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.product.id, item.quantity + 1);
                          }}
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(item.product.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={!selectedTable || selectedProducts.length === 0 || createOrderMutation.isPending}
                onClick={handleCreateOrder}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {createOrderMutation.isPending ? 'Criando...' : 'Criar Pedido'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

