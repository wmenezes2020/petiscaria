
import { TableStatus, TableStatusBadge } from './TableStatusBadge';
import { cva, VariantProps } from 'class-variance-authority';
import { Users, MoreVertical } from 'lucide-react';

const cardVariants = cva(
  'bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between transition-all duration-200 border border-gray-100 border-l-4 hover:shadow-xl cursor-pointer',
  {
    variants: {
      status: {
        available: 'border-green-500',
        occupied: 'border-red-500',
        reserved: 'border-purple-500',
        cleaning: 'border-yellow-500',
        out_of_service: 'border-gray-300',
      },
    },
    defaultVariants: {
      status: 'out_of_service',
    },
  }
);

type TableCardVariant = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';

interface TableCardProps {
  name: string;
  capacity: number;
  status: TableStatus | TableCardVariant;
  area?: string;
}
const statusTranslations: Record<string, string> = {
    available: 'Livre',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    cleaning: 'Em Limpeza',
    out_of_service: 'Fora de Serviço',
};

export function TableCard({ name, capacity, status, area }: TableCardProps) {
  const variantStatuses: TableCardVariant[] = ['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'];
  const statusVariantMap: Record<string, TableCardVariant> = {
    Livre: 'available',
    Ocupada: 'occupied',
    Reservada: 'reserved',
    Fechando: 'cleaning',
    Inativa: 'out_of_service',
  };
  const statusKey = status as string;
  const normalizedStatus: TableCardVariant = variantStatuses.includes(statusKey as TableCardVariant)
    ? (statusKey as TableCardVariant)
    : statusVariantMap[statusKey] ?? 'out_of_service';
  return (
    <div className={`${cardVariants({ status: normalizedStatus })} relative group`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{area || 'Salão'}</p>
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{name}</h3>
        </div>
        <button className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="flex items-center text-gray-600">
          <Users size={18} className="mr-2 text-gray-400" />
          <span className="text-base font-medium text-gray-700">{capacity} lugares</span>
        </div>
        <TableStatusBadge status={status} />
      </div>
    </div>
  );
}
