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
    'bg-accent-blue text-white border-transparent hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  ghost:
    'bg-transparent text-slate-300 border-border hover:bg-bg-surface hover:text-white',
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
        'inline-flex items-center justify-center gap-2 rounded-btn border px-4 py-2 text-sm font-medium transition-all active:scale-95',
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
