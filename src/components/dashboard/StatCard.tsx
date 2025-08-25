
import { cva, VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import React from 'react';

const cardVariants = cva(
  'rounded-xl border bg-white p-6 shadow-sm transition-transform hover:scale-[1.02]',
  {
    variants: {
      color: {
        default: 'border-gray-200',
        blue: 'border-blue-500',
        green: 'border-green-500',
        orange: 'border-orange-500',
        red: 'border-red-500',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  }
);

const iconVariants = cva('rounded-lg p-3 text-white',
  {
    variants: {
      color: {
        default: 'bg-gray-700',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  }
);

interface StatCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: string;
}

export function StatCard({ title, value, icon, color, footer }: StatCardProps) {
  return (
    <div className={cardVariants({ color })}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <div className={iconVariants({ color })}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {footer && (
          <p className="text-sm text-gray-500 mt-1">{footer}</p>
        )}
      </div>
    </div>
  );
}
