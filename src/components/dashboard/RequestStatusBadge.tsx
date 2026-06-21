'use client';

import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; dot: string; pulse: boolean }
> = {
  running: {
    label: 'Running',
    bg: 'border-amber-200 bg-amber-50/80 text-amber-600',
    dot: 'bg-accent-amber',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    bg: 'border-emerald-200 bg-emerald-50/80 text-emerald-600',
    dot: 'bg-accent-green',
    pulse: false,
  },
  failed: {
    label: 'Failed',
    bg: 'border-rose-200 bg-rose-50/80 text-rose-600',
    dot: 'bg-accent-red',
    pulse: false,
  },
  error: {
    label: 'Error',
    bg: 'border-rose-200 bg-rose-50/80 text-rose-600',
    dot: 'bg-accent-red',
    pulse: false,
  },
};

interface RequestStatusBadgeProps {
  status: string;
  isRunning?: boolean;
}

export function RequestStatusBadge({ status, isRunning }: RequestStatusBadgeProps) {
  const key = isRunning ? 'running' : status.trim().toLowerCase();
  const config = STATUS_STYLES[key] ?? {
    label: status || 'Unknown',
    bg: 'border-slate-200 bg-slate-50/80 text-slate-600',
    dot: 'bg-slate-400',
    pulse: false,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold capitalize shadow-sm backdrop-blur',
        config.bg
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          config.dot,
          config.pulse && 'animate-status-pulse'
        )}
      />
      {config.label}
    </span>
  );
}
