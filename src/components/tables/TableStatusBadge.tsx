
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

interface TableStatusBadgeProps {
  status: TableStatus | string | null | undefined;
}

const statusTranslations = {
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
} as const;

type StatusKey = keyof typeof statusTranslations;

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const statusKey = (status ?? 'out_of_service') as string;
  const safeStatus = (statusKey in statusTranslations ? statusKey : 'out_of_service') as StatusKey;
  return (
    <span className={badgeVariants({ status: safeStatus as TableStatus })}>
      {statusTranslations[safeStatus] || 'Inativa'}
    </span>
  );
}
