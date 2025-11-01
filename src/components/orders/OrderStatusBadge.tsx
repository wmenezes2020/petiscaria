
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium capitalize',
  {
    variants: {
      status: {
        PENDING: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
        PREPARING: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
        READY: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
        DELIVERED: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20',
        CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    },
    defaultVariants: {
      status: 'PENDING',
    },
  }
);

export type OrderStatus = VariantProps<typeof badgeVariants>['status'];

interface OrderStatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: OrderStatus;
}

const statusTranslations: Record<OrderStatus & string, string> = {
  PENDING: 'Pendente',
  PREPARING: 'Em Preparo',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={badgeVariants({ status })}>
      {statusTranslations[status || 'PENDING']}
    </span>
  );
}
