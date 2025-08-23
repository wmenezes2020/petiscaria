'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Plus, Edit } from 'lucide-react';

const tableSchema = z.object({
  number: z.number().min(1, 'Número da mesa deve ser maior que 0'),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0'),
  areaId: z.string().uuid('Selecione uma área'),
  minimumOrder: z.number().min(0, 'Pedido mínimo não pode ser negativo'),
  notes: z.string().optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

interface Area {
  id: string;
  name: string;
}

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TableFormData) => void;
  table?: {
    id: string;
    number: number;
    capacity: number;
    areaId: string;
    minimumOrder: number;
    notes?: string;
  };
  areas: Area[];
}

export function TableFormModal({ isOpen, onClose, onSave, table, areas }: TableFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: table?.number || 1,
      capacity: table?.capacity || 4,
      areaId: table?.areaId || '',
      minimumOrder: table?.minimumOrder || 0,
      notes: table?.notes || '',
    },
  });

  useEffect(() => {
    if (isOpen && table) {
      reset({
        number: table.number,
        capacity: table.capacity,
        areaId: table.areaId,
        minimumOrder: table.minimumOrder,
        notes: table.notes,
      });
    } else if (isOpen) {
      reset({
        number: 1,
        capacity: 4,
        areaId: '',
        minimumOrder: 0,
        notes: '',
      });
    }
  }, [isOpen, table, reset]);

  const onSubmit = async (data: TableFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onClose();
      reset();
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              {table ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {table ? 'Editar Mesa' : 'Nova Mesa'}
              </h2>
              <p className="text-sm text-gray-500">
                {table ? 'Atualize as informações da mesa' : 'Configure uma nova mesa'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Mesa
              </label>
              <input
                type="number"
                {...register('number', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="1"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidade
              </label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="4"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <select
              {...register('areaId')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Selecione uma área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {errors.areaId && (
              <p className="mt-1 text-sm text-red-600">{errors.areaId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedido Mínimo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('minimumOrder', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
            />
            {errors.minimumOrder && (
              <p className="mt-1 text-sm text-red-600">{errors.minimumOrder.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Informações adicionais sobre a mesa..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Mesa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
