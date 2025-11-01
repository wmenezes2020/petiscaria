
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium',
  {
    variants: {
      type: {
        ENTRADA: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
        SAIDA: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    },
    defaultVariants: {
      type: 'ENTRADA',
    },
  }
);

export type TransactionType = VariantProps<typeof badgeVariants>['type'];

interface TransactionTypeBadgeProps extends VariantProps<typeof badgeVariants> {
  type: TransactionType;
}

const typeTranslations: Record<TransactionType & string, string> = {
    ENTRADA: 'Entrada',
    SAIDA: 'Saída',
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  return (
    <span className={badgeVariants({ type })}>
      {typeTranslations[type || 'ENTRADA']}
    </span>
  );
}
