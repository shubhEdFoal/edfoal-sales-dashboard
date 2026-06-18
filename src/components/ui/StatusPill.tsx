import type { LeadStatus } from '@/data/leads';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; dot: string; pulse: boolean }
> = {
  SENT: {
    label: 'Sent',
    bg: 'border-amber-200 bg-amber-50/80 text-amber-600',
    dot: 'bg-accent-amber',
    pulse: false,
  },
  REPLIED: {
    label: 'Replied',
    bg: 'border-indigo-200 bg-indigo-50/80 text-indigo-600',
    dot: 'bg-accent-blue',
    pulse: true,
  },
  MEETING_BOOKED: {
    label: 'Meeting Booked',
    bg: 'border-emerald-200 bg-emerald-50/80 text-emerald-600',
    dot: 'bg-accent-green',
    pulse: true,
  },
  NO_RESPONSE: {
    label: 'No Response',
    bg: 'border-rose-200 bg-rose-50/80 text-rose-600',
    dot: 'bg-accent-red',
    pulse: false,
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'border-teal-200 bg-teal-50/80 text-teal-600',
    dot: 'bg-emerald-400',
    pulse: true,
  },
};

interface StatusPillProps {
  status: LeadStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur',
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
