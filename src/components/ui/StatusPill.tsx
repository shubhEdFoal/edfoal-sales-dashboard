import type { LeadStatus } from '@/data/leads';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; dot: string; pulse: boolean }
> = {
  SENT: {
    label: 'Sent',
    bg: 'bg-accent-amber/15 text-accent-amber',
    dot: 'bg-accent-amber',
    pulse: false,
  },
  REPLIED: {
    label: 'Replied',
    bg: 'bg-accent-blue/15 text-accent-blue',
    dot: 'bg-accent-blue',
    pulse: true,
  },
  MEETING_BOOKED: {
    label: 'Meeting Booked',
    bg: 'bg-accent-green/15 text-accent-green',
    dot: 'bg-accent-green',
    pulse: true,
  },
  NO_RESPONSE: {
    label: 'No Response',
    bg: 'bg-accent-red/15 text-accent-red',
    dot: 'bg-accent-red',
    pulse: false,
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'bg-emerald-500/15 text-emerald-400',
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
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
