
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize',
  {
    variants: {
      status: {
        OPEN: 'bg-blue-100 text-blue-800',
        PREPARING: 'bg-yellow-100 text-yellow-800',
        READY: 'bg-orange-100 text-orange-800',
        DELIVERED: 'bg-indigo-100 text-indigo-800',
        CLOSED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      status: 'OPEN',
    },
  }
);

export type OrderStatus = VariantProps<typeof badgeVariants>['status'];

interface OrderStatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: OrderStatus;
}

const statusTranslations: Record<OrderStatus & string, string> = {
    OPEN: 'Aberto',
    PREPARING: 'Em Preparo',
    READY: 'Pronto',
    DELIVERED: 'Entregue',
    CLOSED: 'Fechado',
    CANCELLED: 'Cancelado',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={badgeVariants({ status })}>
      {statusTranslations[status || 'OPEN']}
    </span>
  );
}
