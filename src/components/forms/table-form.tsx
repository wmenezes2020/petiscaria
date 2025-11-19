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
import type { Table } from '@/types';

const tableSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  capacity: z.number().min(1, 'Capacidade deve ser pelo menos 1'),
  areaId: z.string().optional(),
  locationId: z.string().optional(),
  shape: z.enum(['round', 'square', 'rectangular', 'oval']).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isSmoking: z.boolean().optional(),
  isOutdoor: z.boolean().optional(),
  minimumOrder: z.number().optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

interface TableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Table;
  onSuccess?: () => void;
}

export function TableForm({ open, onOpenChange, table, onSuccess }: TableFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: table
      ? {
          name: table.number,
          capacity: table.capacity,
          description: '',
          isActive: true,
          isSmoking: false,
          isOutdoor: false,
        }
      : {
          capacity: 4,
          isActive: true,
          isSmoking: false,
          isOutdoor: false,
        },
  });

  const onSubmit = async (data: TableFormData) => {
    setIsLoading(true);
    try {
      if (table) {
        await api.patch(`/tables/${table.id}`, data);
        toast.success('Mesa atualizada com sucesso');
      } else {
        await api.post('/tables', data);
        toast.success('Mesa criada com sucesso');
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao salvar mesa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{table ? 'Editar Mesa' : 'Nova Mesa'}</DialogTitle>
          <DialogDescription>
            {table ? 'Atualize as informações da mesa' : 'Preencha os dados para criar uma nova mesa'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome/Número da Mesa *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Mesa 1" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidade *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              {...register('capacity', { valueAsNumber: true })}
            />
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shape">Formato</Label>
            <Select
              value={watch('shape') || 'round'}
              onValueChange={(value) => setValue('shape', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">Redonda</SelectItem>
                <SelectItem value="square">Quadrada</SelectItem>
                <SelectItem value="rectangular">Retangular</SelectItem>
                <SelectItem value="oval">Oval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive" className="font-normal">Mesa ativa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isSmoking"
                {...register('isSmoking')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isSmoking" className="font-normal">Área para fumantes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isOutdoor"
                {...register('isOutdoor')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isOutdoor" className="font-normal">Área externa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : table ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

