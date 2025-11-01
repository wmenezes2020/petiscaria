
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-md text-sm font-medium',
  {
    variants: {
      level: {
        OK: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
        LOW: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
        OUT: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
      },
    },
    defaultVariants: {
      level: 'OK',
    },
  }
);

export type StockLevel = VariantProps<typeof badgeVariants>['level'];

interface StockLevelBadgeProps extends VariantProps<typeof badgeVariants> {
  level: StockLevel;
}

const levelTranslations: Record<StockLevel & string, string> = {
    OK: 'Estoque OK',
    LOW: 'Estoque Baixo',
    OUT: 'Sem Estoque',
}

export function StockLevelBadge({ level }: StockLevelBadgeProps) {
  return (
    <span className={badgeVariants({ level })}>
      {levelTranslations[level || 'OK']}
    </span>
  );
}
