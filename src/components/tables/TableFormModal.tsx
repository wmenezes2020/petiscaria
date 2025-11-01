'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Plus, Edit, Table, Users, MapPin, Building2, Hash, FileText, XCircle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

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

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }

    return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
    };
  }, [isOpen, table, reset, onClose]);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modalSlideIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              {table ? <Edit className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {table ? 'Editar Mesa' : 'Nova Mesa'}
              </h3>
              <p className="text-sm text-gray-500">
                {table ? 'Atualize as informações da mesa' : 'Configure uma nova mesa'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div>
            <label htmlFor="name" className="input-label">
              Nome da Mesa *
            </label>
            <div className="relative">
                <Table className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                type="text"
                {...register('name')}
                id="name"
                className="input-field pl-10"
                placeholder="Mesa 1"
                autoFocus
                />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="capacity" className="input-label">
                Capacidade *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                  id="capacity"
                  className="input-field pl-10"
                  placeholder="4"
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="coordinates.x" className="input-label">
                Coordenada X
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  {...register('coordinates.x', { valueAsNumber: true })}
                  id="coordinates.x"
                  className="input-field pl-10"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="areaId" className="input-label">
                Área *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  {...register('areaId')}
                  id="areaId"
                  className="input-field pl-10"
                >
                  <option value="">Selecione uma área</option>
                  {(areas || []).map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.areaId && (
                <p className="text-red-500 text-sm mt-1">{errors.areaId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="locationId" className="input-label">
                Localização *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  {...register('locationId')}
                  id="locationId"
                  className="input-field pl-10"
                >
                  <option value="">Selecione uma localização</option>
                  {(locations || []).map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  )) || []}
                </select>
              </div>
              {errors.locationId && (
                <p className="text-red-500 text-sm mt-1">{errors.locationId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isActive')}
                id="isActive"
                className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Mesa Ativa
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('isAvailable')}
                id="isAvailable"
                className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out rounded focus:ring-indigo-500"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                Mesa Disponível
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="coordinates.y" className="input-label">
              Coordenada Y
            </label>
            <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                type="number"
                {...register('coordinates.y', { valueAsNumber: true })}
                id="coordinates.y"
                className="input-field pl-10"
                placeholder="0"
                />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="input-label">
              Descrição
            </label>
            <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <textarea
                {...register('description')}
                id="description"
                rows={3}
                className="input-field pl-10 resize-none"
                placeholder="Informações adicionais sobre a mesa..."
                />
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>{table ? 'Atualizando...' : 'Criando...'}</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                <span>{table ? 'Atualizar Mesa' : 'Criar Mesa'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
