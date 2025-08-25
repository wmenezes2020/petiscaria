
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide capitalize',
  {
    variants: {
      status: {
        PENDING: 'bg-blue-100 text-blue-800',
        PREPARING: 'bg-yellow-100 text-yellow-800',
        READY: 'bg-orange-100 text-orange-800',
        DELIVERED: 'bg-indigo-100 text-indigo-800',
        CANCELLED: 'bg-red-100 text-red-800',
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
