import type { FunnelStage } from '@/lib/sheets/kpi';

interface PipelineFunnelProps {
  stages: FunnelStage[];
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  return (
    <section className="rounded-card border border-border bg-bg-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-white">Pipeline Funnel</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.label} className="text-center">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {stage.label}
            </p>
            <div className="h-8 overflow-hidden rounded-btn bg-bg-deep">
              <div
                className={`h-full ${stage.color} transition-all duration-500`}
                style={{ width: stage.width }}
              />
            </div>
            <p className="mt-2 font-mono text-sm font-bold text-white">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex h-10 overflow-hidden rounded-btn">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className={`${stage.color} min-w-[4px]`}
            style={{ flex: Math.max(stage.count, 0.5) }}
            title={stage.label}
          />
        ))}
      </div>
    </section>
  );
}
