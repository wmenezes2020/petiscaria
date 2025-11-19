'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types';

const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  movementType: z.enum(['in', 'out', 'adjustment', 'transfer', 'loss', 'return']),
  reason: z.enum(['purchase', 'sale', 'consumption', 'adjustment', 'transfer', 'loss', 'return', 'initial_stock', 'inventory_count']),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  unitCost: z.number().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

interface StockMovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await api.get<{ products?: Product[]; data?: Product[] }>('/products');
  return response.products || response.data || [];
}

export function StockMovementForm({ open, onOpenChange, onSuccess }: StockMovementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      movementType: 'in',
      reason: 'purchase',
    },
  });

  const movementType = watch('movementType');

  const onSubmit = async (data: StockMovementFormData) => {
    setIsLoading(true);
    try {
      await api.post('/stock', data);
      toast.success('Movimentação registrada com sucesso');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao registrar movimentação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
          <DialogDescription>Registre uma entrada ou saída de estoque</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Produto *</Label>
            <Select
              value={watch('productId') || ''}
              onValueChange={(value) => setValue('productId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productId && <p className="text-sm text-red-500">{errors.productId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="movementType">Tipo de Movimentação *</Label>
            <Select
              value={watch('movementType') || 'in'}
              onValueChange={(value) => setValue('movementType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrada</SelectItem>
                <SelectItem value="out">Saída</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="loss">Perda</SelectItem>
                <SelectItem value="return">Devolução</SelectItem>
              </SelectContent>
            </Select>
            {errors.movementType && <p className="text-sm text-red-500">{errors.movementType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Select
              value={watch('reason') || 'purchase'}
              onValueChange={(value) => setValue('reason', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementType === 'in' && (
                  <>
                    <SelectItem value="purchase">Compra</SelectItem>
                    <SelectItem value="return">Devolução</SelectItem>
                    <SelectItem value="initial_stock">Estoque Inicial</SelectItem>
                    <SelectItem value="inventory_count">Contagem de Inventário</SelectItem>
                  </>
                )}
                {movementType === 'out' && (
                  <>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="consumption">Consumo</SelectItem>
                    <SelectItem value="loss">Perda</SelectItem>
                  </>
                )}
                {(movementType === 'adjustment' || movementType === 'transfer') && (
                  <>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitCost">Custo Unitário (opcional)</Label>
            <Input
              id="unitCost"
              type="number"
              step="0.01"
              min="0"
              {...register('unitCost', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referência (opcional)</Label>
            <Input id="reference" {...register('reference')} placeholder="Ex: NF 123" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

