import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowButtonProps {
  variant: 'primary' | 'ghost' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const variantStyles = {
  primary:
    'border-transparent bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/25',
  ghost:
    'border-white/60 bg-white/55 text-slate-700 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/80 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-600/10',
  danger:
    'bg-accent-red/10 text-accent-red border-accent-red/30 hover:bg-accent-red/20',
};

export function GlowButton({
  variant,
  onClick,
  children,
  icon: Icon,
  className,
  type = 'button',
  disabled = false,
}: GlowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-300 ease-in-out active:scale-95',
        variantStyles[variant],
        disabled && 'cursor-not-allowed opacity-50 active:scale-100 hover:shadow-none',
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
