'use client';

import { AlertTriangle, Gauge, Target, TrendingUp } from 'lucide-react';
import type { QuadrantStats as QuadrantStatsData } from '@/lib/sheets/analytics';
import { cn } from '@/lib/utils';

interface QuadrantStatsProps {
  data: QuadrantStatsData;
}

interface MiniMetric {
  label: string;
  value: string;
  hint?: string;
  status?: 'good' | 'warn' | 'bad' | 'neutral';
}

function statusColor(status?: MiniMetric['status']): string {
  switch (status) {
    case 'good':
      return 'text-accent-green';
    case 'warn':
      return 'text-accent-amber';
    case 'bad':
      return 'text-accent-red';
    default:
      return 'text-white';
  }
}

function QuadrantCard({
  badge,
  badgeColor,
  title,
  icon: Icon,
  iconColor,
  primary,
  secondary,
  accentBorder,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  icon: typeof Target;
  iconColor: string;
  primary: { label: string; value: string; status?: MiniMetric['status'] };
  secondary: MiniMetric[];
  accentBorder: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-card border bg-bg-surface p-5',
        accentBorder
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
            badgeColor
          )}
        >
          {badge}
        </span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-btn bg-bg-deep')}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>

      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <p className={cn('text-4xl font-bold leading-tight', statusColor(primary.status))}>
        {primary.value}
      </p>
      <p className="mb-4 text-xs text-slate-400">{primary.label}</p>

      <div className="mt-auto grid grid-cols-1 gap-2 border-t border-border pt-4">
        {secondary.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-slate-400">{m.label}</span>
            <span
              className={cn('font-mono text-sm font-semibold', statusColor(m.status))}
            >
              {m.value}
              {m.hint && (
                <span className="ml-1 text-[10px] font-normal text-slate-500">
                  {m.hint}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuadrantStats({ data }: QuadrantStatsProps) {
  const { lagging, leading, diagnostic, alerts } = data;

  const replyStatus: MiniMetric['status'] =
    leading.replyRate >= 30 ? 'good' : leading.replyRate >= 10 ? 'warn' : 'bad';
  const meetingRateStatus: MiniMetric['status'] =
    leading.meetingBookingRate >= 10
      ? 'good'
      : leading.meetingBookingRate >= 3
        ? 'warn'
        : 'bad';

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <QuadrantCard
        badge="Lagging"
        badgeColor="bg-accent-green/10 text-accent-green"
        accentBorder="border-accent-green/30"
        title="Qualified Leads"
        icon={Target}
        iconColor="text-accent-green"
        primary={{
          value: String(lagging.qualified),
          label: `${lagging.qualifiedRate}% of all leads`,
          status: 'good',
        }}
        secondary={[
          {
            label: 'Meetings booked',
            value: String(lagging.meetings),
            status: 'neutral',
          },
          {
            label: 'Qualification rate',
            value: `${lagging.qualifiedRate}%`,
            status: lagging.qualifiedRate >= 5 ? 'good' : 'warn',
          },
        ]}
      />

      <QuadrantCard
        badge="Leading"
        badgeColor="bg-accent-blue/10 text-accent-blue"
        accentBorder="border-accent-blue/30"
        title="Reply Rate"
        icon={TrendingUp}
        iconColor="text-accent-blue"
        primary={{
          value: `${leading.replyRate}%`,
          label: 'Predicts future meetings 7\u201314 days out',
          status: replyStatus,
        }}
        secondary={[
          {
            label: 'Meeting booking rate',
            value: `${leading.meetingBookingRate}%`,
            status: meetingRateStatus,
          },
          {
            label: 'Active outreach',
            value: String(leading.activeOutreach),
            status: 'neutral',
          },
        ]}
      />

      <QuadrantCard
        badge="Diagnostic"
        badgeColor="bg-slate-500/10 text-slate-300"
        accentBorder="border-border"
        title="Conversion Ratios"
        icon={Gauge}
        iconColor="text-slate-300"
        primary={{
          value: `${diagnostic.repliedToMeeting}%`,
          label: 'Replied \u2192 Meeting (the critical link)',
          status:
            diagnostic.repliedToMeeting >= 40
              ? 'good'
              : diagnostic.repliedToMeeting >= 20
                ? 'warn'
                : 'bad',
        }}
        secondary={[
          {
            label: 'Sent \u2192 Replied',
            value: `${diagnostic.sentToReplied}%`,
          },
          {
            label: 'Meeting \u2192 Qualified',
            value: `${diagnostic.meetingToQualified}%`,
          },
        ]}
      />

      <QuadrantCard
        badge="Alerts"
        badgeColor="bg-accent-red/10 text-accent-red"
        accentBorder={cn(alerts.total > 0 ? 'border-accent-red/40' : 'border-border')}
        title="Action Items"
        icon={AlertTriangle}
        iconColor="text-accent-red"
        primary={{
          value: String(alerts.total),
          label: 'Issues needing attention this week',
          status: alerts.total === 0 ? 'good' : alerts.total > 5 ? 'bad' : 'warn',
        }}
        secondary={[
          {
            label: 'RED health',
            value: String(alerts.redHealth),
            status: alerts.redHealth > 0 ? 'bad' : 'good',
          },
          {
            label: 'Replied, no meeting',
            value: String(alerts.repliedNoMeeting),
            status: alerts.repliedNoMeeting > 0 ? 'warn' : 'good',
          },
          {
            label: 'Stalled follow-ups',
            value: String(alerts.stalled),
            status: alerts.stalled > 0 ? 'warn' : 'good',
          },
        ]}
      />
    </section>
  );
}
