
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
  {
    variants: {
      status: {
        Livre: 'bg-green-100 text-green-800',
        Ocupada: 'bg-blue-100 text-blue-800',
        Reservada: 'bg-purple-100 text-purple-800',
        Fechando: 'bg-yellow-100 text-yellow-800',
        Inativa: 'bg-gray-100 text-gray-800',
      },
    },
    defaultVariants: {
      status: 'Inativa',
    },
  }
);

export type TableStatus = VariantProps<typeof badgeVariants>['status'];

interface TableStatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: TableStatus;
}

const statusTranslations: Record<TableStatus & string, string> = {
    Livre: 'Livre',
    Ocupada: 'Ocupada',
    Reservada: 'Reservada',
    Fechando: 'Fechando Conta',
    Inativa: 'Inativa',
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  return (
    <span className={badgeVariants({ status })}>
      {statusTranslations[status || 'Inativa']}
    </span>
  );
}
