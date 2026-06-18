'use client';

import { ArrowRight } from 'lucide-react';
import { Fragment } from 'react';
import type { MetricChainStep } from '@/lib/sheets/analytics';
import { cn } from '@/lib/utils';

interface MetricChainProps {
  chain: MetricChainStep[];
}

function colorForStep(key: MetricChainStep['key']): { dot: string; text: string; bar: string } {
  switch (key) {
    case 'discovered':
      return { dot: 'bg-slate-500', text: 'text-slate-700', bar: 'bg-slate-500' };
    case 'sent':
      return { dot: 'bg-accent-blue', text: 'text-accent-blue', bar: 'bg-accent-blue' };
    case 'responded':
      return { dot: 'bg-accent-blue', text: 'text-accent-blue', bar: 'bg-accent-blue' };
    case 'replied':
      return { dot: 'bg-accent-amber', text: 'text-accent-amber', bar: 'bg-accent-amber' };
    case 'meeting':
      return { dot: 'bg-accent-green', text: 'text-accent-green', bar: 'bg-accent-green' };
    case 'qualified':
      return { dot: 'bg-accent-green', text: 'text-accent-green', bar: 'bg-accent-green' };
  }
}

function conversionBadge(value: number): string {
  if (value >= 50) return 'text-accent-green border-accent-green/30 bg-accent-green/10';
  if (value >= 20) return 'text-accent-amber border-accent-amber/30 bg-accent-amber/10';
  if (value > 0) return 'text-accent-red border-accent-red/30 bg-accent-red/10';
  return 'text-slate-500 border-white/60 bg-white/55';
}

export function MetricChain({ chain }: MetricChainProps) {
  const max = Math.max(...chain.map((s) => s.count), 1);

  return (
    <section className="widget-card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-950">Metric Chain</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Cause &rarr; Effect
        </span>
      </div>
      <p className="mb-6 text-xs text-slate-400">
        Each step shows conversion % from the previous one. Wherever a link breaks, intervene
        there.
      </p>

      <div className="hidden md:flex md:items-stretch md:gap-2">
        {chain.map((step, idx) => {
          const colors = colorForStep(step.key);
          const heightPct = (step.count / max) * 100;
          return (
            <Fragment key={step.key}>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', colors.dot)} />
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {step.label}
                  </p>
                </div>
                <div className="relative flex h-28 items-end overflow-hidden rounded-2xl bg-white/55 shadow-inner backdrop-blur">
                  <div
                    className={cn('w-full transition-all duration-500', colors.bar)}
                    style={{ height: `${Math.max(heightPct, step.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <p className={cn('mt-2 font-mono text-2xl font-bold', colors.text)}>
                  {step.count}
                </p>
              </div>
              {idx < chain.length - 1 && (
                <div className="flex w-14 flex-col items-center justify-center pt-6">
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                  {(() => {
                    const next = chain[idx + 1];
                    if (next.conversionFromPrev === null) return null;
                    return (
                      <span
                        className={cn(
                          'mt-2 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold',
                          conversionBadge(next.conversionFromPrev)
                        )}
                      >
                        {next.conversionFromPrev}%
                      </span>
                    );
                  })()}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="space-y-3 md:hidden">
        {chain.map((step) => {
          const colors = colorForStep(step.key);
          return (
            <div key={step.key} className="flex items-center gap-3">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {step.label}
                  </p>
                  <p className={cn('font-mono text-lg font-bold', colors.text)}>
                    {step.count}
                  </p>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/55 shadow-inner backdrop-blur">
                  <div
                    className={cn('h-full', colors.bar)}
                    style={{ width: `${(step.count / max) * 100}%` }}
                  />
                </div>
              </div>
              {step.conversionFromPrev !== null && (
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold',
                    conversionBadge(step.conversionFromPrev)
                  )}
                >
                  {step.conversionFromPrev}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
