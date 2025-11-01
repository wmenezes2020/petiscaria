
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
  {
    variants: {
      status: {
        // Rótulos em português (compatibilidade)
        Livre: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
        Ocupada: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
        Reservada: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
        Fechando: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
        Inativa: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
        // Estados do backend (compatibilidade)
        available: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
        occupied: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
        reserved: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20',
        cleaning: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
        out_of_service: 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
      },
    },
    defaultVariants: {
      status: 'out_of_service',
    },
  }
);

export type TableStatus = VariantProps<typeof badgeVariants>['status'];

interface TableStatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: TableStatus | 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';
}

const statusTranslations: Record<string, string> = {
  Livre: 'Livre',
  Ocupada: 'Ocupada',
  Reservada: 'Reservada',
  Fechando: 'Em Limpeza',
  Inativa: 'Fora de Serviço',
  available: 'Livre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'Em Limpeza',
  out_of_service: 'Fora de Serviço',
};

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const safeStatus = (status || 'out_of_service') as any;
  return (
    <span className={badgeVariants({ status: safeStatus })}>
      {statusTranslations[safeStatus] || 'Inativa'}
    </span>
  );
}
