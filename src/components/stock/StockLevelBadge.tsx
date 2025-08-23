
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
  {
    variants: {
      level: {
        OK: 'bg-green-100 text-green-800',
        LOW: 'bg-yellow-100 text-yellow-800',
        OUT: 'bg-red-100 text-red-800',
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
