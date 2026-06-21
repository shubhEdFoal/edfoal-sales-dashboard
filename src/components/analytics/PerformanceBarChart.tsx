'use client';

import { cn } from '@/lib/utils';

export interface PerformanceRow {
  label: string;
  total: number;
  replyRate: number;
  meetingRate: number;
  qualifiedRate: number;
}

interface PerformanceBarChartProps {
  title: string;
  subtitle?: string;
  rows: PerformanceRow[];
  emptyMessage?: string;
}

const METRIC_DEFS = [
  { key: 'replyRate' as const, label: 'Reply', bar: 'bg-accent-blue', text: 'text-accent-blue' },
  { key: 'meetingRate' as const, label: 'Meeting', bar: 'bg-accent-amber', text: 'text-accent-amber' },
  {
    key: 'qualifiedRate' as const,
    label: 'Qualified',
    bar: 'bg-accent-green',
    text: 'text-accent-green',
  },
];

export function PerformanceBarChart({
  title,
  subtitle,
  rows,
  emptyMessage,
}: PerformanceBarChartProps) {
  const maxRate = Math.max(
    1,
    ...rows.flatMap((r) => [r.replyRate, r.meetingRate, r.qualifiedRate])
  );

  const populated = rows.filter((r) => r.total > 0);
  const hasData = populated.length > 0;

  return (
    <section className="widget-card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {METRIC_DEFS.map((m) => (
            <div key={m.key} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-sm', m.bar)} />
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="rounded-2xl border border-dashed border-indigo-200 bg-white/45 px-4 py-6 text-center text-xs text-slate-500">
          {emptyMessage ?? 'Not enough data yet for this breakdown.'}
        </p>
      ) : (
        <div className="space-y-5">
          {rows.map((row) => {
            const isEmpty = row.total === 0;
            return (
              <div
                key={row.label}
                className={cn('space-y-2', isEmpty && 'opacity-40')}
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-bold text-slate-800">{row.label}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    n = {row.total}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {METRIC_DEFS.map((m) => {
                    const value = row[m.key];
                    const widthPct = (value / maxRate) * 100;
                    return (
                      <div key={m.key} className="flex items-center gap-3">
                        <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-white/55 shadow-inner backdrop-blur">
                          <div
                            className={cn('h-full transition-all duration-500', m.bar)}
                            style={{
                              width: `${Math.max(widthPct, value > 0 ? 2 : 0)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            'w-14 shrink-0 text-right font-mono text-xs font-semibold',
                            value > 0 ? m.text : 'text-slate-600'
                          )}
                        >
                          {value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
