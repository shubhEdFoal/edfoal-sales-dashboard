'use client';

import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<
  string,
  { label: string; bg: string; dot: string; pulse: boolean }
> = {
  running: {
    label: 'Running',
    bg: 'bg-accent-amber/15 text-accent-amber',
    dot: 'bg-accent-amber',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-accent-green/15 text-accent-green',
    dot: 'bg-accent-green',
    pulse: false,
  },
  failed: {
    label: 'Failed',
    bg: 'bg-accent-red/15 text-accent-red',
    dot: 'bg-accent-red',
    pulse: false,
  },
  error: {
    label: 'Error',
    bg: 'bg-accent-red/15 text-accent-red',
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
    bg: 'bg-slate-500/15 text-slate-300',
    dot: 'bg-slate-400',
    pulse: false,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
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
