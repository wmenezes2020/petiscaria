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

const openCashRegisterSchema = z.object({
  openingBalance: z.number().min(0, 'Saldo inicial deve ser maior ou igual a zero'),
  notes: z.string().optional(),
});

const closeCashRegisterSchema = z.object({
  closingBalance: z.number().min(0, 'Saldo final deve ser maior ou igual a zero'),
  notes: z.string().optional(),
});

const cashMovementSchema = z.object({
  movementType: z.enum(['opening', 'closing', 'sale', 'refund', 'withdrawal', 'deposit', 'expense', 'adjustment']),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
});

type OpenCashRegisterFormData = z.infer<typeof openCashRegisterSchema>;
type CloseCashRegisterFormData = z.infer<typeof closeCashRegisterSchema>;
type CashMovementFormData = z.infer<typeof cashMovementSchema>;

interface CashRegisterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'open' | 'close' | 'movement';
  onSuccess?: () => void;
}

export function CashRegisterForm({ open, onOpenChange, type, onSuccess }: CashRegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const openForm = useForm<OpenCashRegisterFormData>({
    resolver: zodResolver(openCashRegisterSchema),
    defaultValues: {
      openingBalance: 0,
    },
  });

  const closeForm = useForm<CloseCashRegisterFormData>({
    resolver: zodResolver(closeCashRegisterSchema),
    defaultValues: {
      closingBalance: 0,
    },
  });

  const movementForm = useForm<CashMovementFormData>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: {
      movementType: 'deposit',
    },
  });

  const onSubmitOpen = async (data: OpenCashRegisterFormData) => {
    setIsLoading(true);
    try {
      await api.post('/cash-registers/open', data);
      toast.success('Caixa aberto com sucesso');
      openForm.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao abrir caixa');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitClose = async (data: CloseCashRegisterFormData) => {
    setIsLoading(true);
    try {
      await api.post('/cash-registers/close', data);
      toast.success('Caixa fechado com sucesso');
      closeForm.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao fechar caixa');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitMovement = async (data: CashMovementFormData) => {
    setIsLoading(true);
    try {
      await api.post('/cash-registers/movements', data);
      toast.success('Movimentação registrada com sucesso');
      movementForm.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erro ao registrar movimentação');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'open':
        return 'Abrir Caixa';
      case 'close':
        return 'Fechar Caixa';
      case 'movement':
        return 'Nova Movimentação';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'open':
        return 'Informe o saldo inicial do caixa';
      case 'close':
        return 'Informe o saldo final do caixa';
      case 'movement':
        return 'Registre uma movimentação no caixa';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {type === 'open' && (
          <form onSubmit={openForm.handleSubmit(onSubmitOpen)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Saldo Inicial *</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                min="0"
                {...openForm.register('openingBalance', { valueAsNumber: true })}
              />
              {openForm.formState.errors.openingBalance && (
                <p className="text-sm text-red-500">{openForm.formState.errors.openingBalance.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" {...openForm.register('notes')} rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Abrindo...' : 'Abrir Caixa'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {type === 'close' && (
          <form onSubmit={closeForm.handleSubmit(onSubmitClose)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="closingBalance">Saldo Final *</Label>
              <Input
                id="closingBalance"
                type="number"
                step="0.01"
                min="0"
                {...closeForm.register('closingBalance', { valueAsNumber: true })}
              />
              {closeForm.formState.errors.closingBalance && (
                <p className="text-sm text-red-500">{closeForm.formState.errors.closingBalance.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" {...closeForm.register('notes')} rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Fechando...' : 'Fechar Caixa'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {type === 'movement' && (
          <form onSubmit={movementForm.handleSubmit(onSubmitMovement)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="movementType">Tipo de Movimentação *</Label>
              <Select
                value={movementForm.watch('movementType') || 'deposit'}
                onValueChange={(value) => movementForm.setValue('movementType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="refund">Reembolso</SelectItem>
                  <SelectItem value="withdrawal">Retirada</SelectItem>
                  <SelectItem value="deposit">Depósito</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                </SelectContent>
              </Select>
              {movementForm.formState.errors.movementType && (
                <p className="text-sm text-red-500">{movementForm.formState.errors.movementType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...movementForm.register('amount', { valueAsNumber: true })}
              />
              {movementForm.formState.errors.amount && (
                <p className="text-sm text-red-500">{movementForm.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea id="description" {...movementForm.register('description')} rows={3} />
              {movementForm.formState.errors.description && (
                <p className="text-sm text-red-500">{movementForm.formState.errors.description.message}</p>
              )}
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
        )}
      </DialogContent>
    </Dialog>
  );
}

