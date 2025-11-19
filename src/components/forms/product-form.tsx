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
import type { Product, Category } from '@/types';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  costPrice: z.number().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  stockQuantity: z.number().optional(),
  minStockLevel: z.number().optional(),
  maxStockLevel: z.number().optional(),
  unit: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onSuccess?: () => void;
}

async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<{ categories?: Category[]; data?: Category[] }>('/categories');
  return response.categories || response.data || [];
}

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          costPrice: 0,
          categoryId: product.categoryId || '',
          sku: product.sku,
          barcode: (product as any).barcode,
          isActive: product.isActive,
          isAvailable: product.isAvailable,
          stockQuantity: product.stockQuantity,
          minStockLevel: product.minStockLevel,
          maxStockLevel: product.maxStockLevel,
          unit: 'unidade',
        }
      : {
          price: 0,
          isActive: true,
          isAvailable: true,
          stockQuantity: 0,
          minStockLevel: 0,
          maxStockLevel: 1000,
          unit: 'unidade',
        },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      if (product) {
        await api.patch(`/products/${product.id}`, data);
        toast.success('Produto atualizado com sucesso');
      } else {
        await api.post('/products', data);
        toast.success('Produto criado com sucesso');
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Atualize as informações do produto' : 'Preencha os dados para criar um novo produto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria *</Label>
              <Select
                value={watch('categoryId') || ''}
                onValueChange={(value) => setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('costPrice', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Estoque</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                {...register('stockQuantity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input id="barcode" {...register('barcode')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                {...register('minStockLevel', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Estoque Máximo</Label>
              <Input
                id="maxStockLevel"
                type="number"
                min="0"
                {...register('maxStockLevel', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="font-normal">Produto ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                {...register('isAvailable')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isAvailable" className="font-normal">Disponível para venda</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

