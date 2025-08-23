
import { TableStatus, TableStatusBadge } from './TableStatusBadge';
import { cva, VariantProps } from 'class-variance-authority';
import { Users, MoreVertical } from 'lucide-react';

const cardVariants = cva(
  'bg-white rounded-lg shadow-md p-5 flex flex-col justify-between transition-all duration-200 border-l-4 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
  {
    variants: {
      status: {
        Livre: 'border-green-500',
        Ocupada: 'border-blue-500',
        Reservada: 'border-purple-500',
        Fechando: 'border-yellow-500',
        Inativa: 'border-gray-300',
      },
    },
    defaultVariants: {
      status: 'Inativa',
    },
  }
);

interface TableCardProps {
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  area?: string;
}

export function TableCard({ tableNumber, capacity, status, area }: TableCardProps) {
  return (
    <div className={cardVariants({ status })}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{area || 'Salão'}</p>
          <h3 className="text-2xl font-bold text-gray-800">Mesa {String(tableNumber).padStart(2, '0')}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="flex items-center text-gray-600">
          <Users size={16} className="mr-2" />
          <span className="text-sm font-medium">{capacity} lugares</span>
        </div>
        <TableStatusBadge status={status} />
      </div>
    </div>
  );
}
