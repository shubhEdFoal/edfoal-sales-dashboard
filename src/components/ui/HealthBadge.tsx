import type { CampaignHealth } from '@/data/leads';
import { cn } from '@/lib/utils';

const healthConfig: Record<CampaignHealth, { dot: string; label: string; className: string }> = {
  GREEN: {
    dot: 'bg-emerald-500',
    label: 'Healthy',
    className: 'border-emerald-200 bg-emerald-50/80 text-emerald-600',
  },
  YELLOW: {
    dot: 'bg-amber-500',
    label: 'Early Stage',
    className: 'border-amber-200 bg-amber-50/80 text-amber-600',
  },
  RED: {
    dot: 'bg-rose-500',
    label: 'At Risk',
    className: 'border-rose-200 bg-rose-50/80 text-rose-600',
  },
};

interface HealthBadgeProps {
  health: CampaignHealth;
}

export function HealthBadge({ health }: HealthBadgeProps) {
  const config = healthConfig[health];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
}
