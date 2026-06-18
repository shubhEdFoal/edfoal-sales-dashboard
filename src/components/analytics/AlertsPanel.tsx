'use client';

import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ActionItem, AlertSeverity } from '@/lib/sheets/analytics';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  items: ActionItem[];
}

const SEVERITY_MAP: Record<
  AlertSeverity,
  { icon: typeof AlertOctagon; iconColor: string; ring: string; badge: string }
> = {
  red: {
    icon: AlertOctagon,
    iconColor: 'text-accent-red',
    ring: 'border-accent-red/30 bg-accent-red/5',
    badge: 'bg-accent-red/10 text-accent-red',
  },
  amber: {
    icon: AlertTriangle,
    iconColor: 'text-accent-amber',
    ring: 'border-accent-amber/30 bg-accent-amber/5',
    badge: 'bg-accent-amber/10 text-accent-amber',
  },
  blue: {
    icon: Info,
    iconColor: 'text-accent-blue',
    ring: 'border-accent-blue/30 bg-accent-blue/5',
    badge: 'bg-accent-blue/10 text-accent-blue',
  },
};

export function AlertsPanel({ items }: AlertsPanelProps) {
  const active = items.filter((i) => i.count > 0);
  const totalActions = active.reduce((sum, i) => sum + i.count, 0);

  return (
    <section className="widget-card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-950">Alerts &amp; Action Items</h2>
        <span className="rounded-full border border-white/60 bg-white/55 px-3 py-1 font-mono text-xs font-semibold text-slate-500 backdrop-blur">
          {totalActions} total
        </span>
      </div>
      <p className="mb-5 text-xs text-slate-400">
        Threshold breach &rarr; recommended action. Only items that need action right now are
        shown.
      </p>

      {active.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-green" />
          <div>
            <p className="text-sm font-bold text-slate-900">All clear</p>
            <p className="text-xs text-slate-400">
              No active alerts. Pipeline is healthy.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {active.map((item) => {
            const sev = SEVERITY_MAP[item.severity];
            const Icon = sev.icon;
            return (
              <li
                key={item.id}
                className={cn('rounded-2xl border p-4 backdrop-blur', sev.ring)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', sev.iconColor)} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold',
                          sev.badge
                        )}
                      >
                        {item.count} {item.count === 1 ? 'lead' : 'leads'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                    <p className="mt-2 text-xs text-slate-600">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                        Do this &rarr;{' '}
                      </span>
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
