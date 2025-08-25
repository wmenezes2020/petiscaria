'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Plus, Edit } from 'lucide-react';

const tableSchema = z.object({
  name: z.string().min(1, 'Nome da mesa é obrigatório'),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0'),
  areaId: z.string().uuid('Selecione uma área'),
  locationId: z.string().uuid('Selecione uma localização'),
  isActive: z.boolean(),
  isAvailable: z.boolean(),
  description: z.string().optional(),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
});

type TableFormData = z.infer<typeof tableSchema>;

interface Area {
  id: string;
  name: string;
  description?: string;
}

interface Location {
  id: string;
  name: string;
  description?: string;
}

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TableFormData) => void;
  table?: {
    id: string;
    name: string;
    capacity: number;
    areaId: string;
    locationId: string;
    isActive: boolean;
    isAvailable: boolean;
    description?: string;
    coordinates?: {
      x: number;
      y: number;
    };
  };
  areas: Area[];
  locations?: Location[];
}

export function TableFormModal({ isOpen, onClose, onSave, table, areas, locations }: TableFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: table?.name || '',
      capacity: table?.capacity || 4,
      areaId: table?.areaId || '',
      locationId: table?.locationId || '',
      isActive: table?.isActive ?? true,
      isAvailable: table?.isAvailable ?? true,
      description: table?.description || '',
      coordinates: table?.coordinates || { x: 0, y: 0 },
    },
  });

  useEffect(() => {
    if (isOpen && table) {
      reset({
        name: table.name,
        capacity: table.capacity,
        areaId: table.areaId,
        locationId: table.locationId,
        isActive: table.isActive,
        isAvailable: table.isAvailable,
        description: table.description || '',
        coordinates: table.coordinates || { x: 0, y: 0 },
      });
    } else if (isOpen) {
      reset({
        name: '',
        capacity: 4,
        areaId: '',
        locationId: '',
        isActive: true,
        isAvailable: true,
        description: '',
        coordinates: { x: 0, y: 0 },
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
    <div
      className="fixed inset-0 flex items-center justify-center p-4 transition-all duration-200"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Mesa
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Mesa 1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordenada X
              </label>
              <input
                type="number"
                {...register('coordinates.x', { valueAsNumber: true })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                Localização
              </label>
              <select
                {...register('locationId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Selecione uma localização</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                )) || []}
              </select>
              {errors.locationId && (
                <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Mesa Ativa
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isAvailable')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Mesa Disponível
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordenada Y
            </label>
            <input
              type="number"
              {...register('coordinates.y', { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              {...register('description')}
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
