import type { CampaignHealth } from '@/data/leads';

const healthConfig: Record<CampaignHealth, { emoji: string; label: string }> = {
  GREEN: { emoji: '🟢', label: 'Healthy' },
  YELLOW: { emoji: '🟡', label: 'Early Stage' },
  RED: { emoji: '🔴', label: 'At Risk' },
};

interface HealthBadgeProps {
  health: CampaignHealth;
}

export function HealthBadge({ health }: HealthBadgeProps) {
  const config = healthConfig[health];

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-300">
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
