'use client';

import { useMemo } from 'react';
import type { Lead } from '@/data/leads';
import { computeAnalytics } from '@/lib/sheets/analytics';
import { AlertsPanel } from './AlertsPanel';
import { MetricChain } from './MetricChain';
import { PerformanceBarChart } from './PerformanceBarChart';
import { QuadrantStats } from './QuadrantStats';

interface AnalyticsViewProps {
  leads: Lead[];
}

export function AnalyticsView({ leads }: AnalyticsViewProps) {
  const analytics = useMemo(() => computeAnalytics(leads), [leads]);

  return (
    <div className="space-y-6">
      <QuadrantStats data={analytics.quadrant} />

      <MetricChain chain={analytics.chain} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceBarChart
          title="Email Style Performance"
          subtitle="Which style converts best \u2014 reply / meeting / qualified rate."
          rows={analytics.styles.map((s) => ({
            label: s.style,
            total: s.total,
            replyRate: s.replyRate,
            meetingRate: s.meetingRate,
            qualifiedRate: s.qualifiedRate,
          }))}
        />
        <PerformanceBarChart
          title="Target Segment Performance"
          subtitle="Top segments by lead volume \u2014 check ICP fit."
          rows={analytics.segments.map((s) => ({
            label: s.segment,
            total: s.total,
            replyRate: s.replyRate,
            meetingRate: s.meetingRate,
            qualifiedRate: s.qualifiedRate,
          }))}
          emptyMessage="Populate the targetSegment column in your sheet to see this breakdown."
        />
      </div>

      <AlertsPanel items={analytics.actionItems} />
    </div>
  );
}
