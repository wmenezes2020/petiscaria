
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
  {
    variants: {
      type: {
        ENTRADA: 'bg-green-100 text-green-800',
        SAIDA: 'bg-red-100 text-red-800',
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
