'use client';

import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { AlertsPanel } from '@/components/analytics/AlertsPanel';
import { MetricChain } from '@/components/analytics/MetricChain';
import { QuadrantStats } from '@/components/analytics/QuadrantStats';
import { KPISection } from '@/components/dashboard/KPISection';
import { LeadRequestStatusPanel } from '@/components/dashboard/LeadRequestStatusPanel';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import type { Lead } from '@/data/leads';
import { computeAnalytics } from '@/lib/sheets/analytics';
import type { LeadKPI } from '@/lib/sheets/kpi';

const RECENT_LEADS_LIMIT = 5;

interface DashboardViewProps {
  leads: Lead[];
  kpi: LeadKPI;
  statusRefreshKey?: number;
  onViewLead?: (lead: Lead) => void;
  onViewAllLeads?: () => void;
}

export function DashboardView({
  leads,
  kpi,
  statusRefreshKey,
  onViewLead,
  onViewAllLeads,
}: DashboardViewProps) {
  const analytics = useMemo(() => computeAnalytics(leads), [leads]);
  const recentLeads = useMemo(() => leads.slice(0, RECENT_LEADS_LIMIT), [leads]);

  return (
    <div className="space-y-6">
      <KPISection kpi={kpi} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LeadRequestStatusPanel refreshKey={statusRefreshKey} />

        <section className="flex h-[400px] flex-col overflow-hidden rounded-card border border-border bg-bg-surface p-5">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
              <p className="text-xs text-slate-400">
                Latest {RECENT_LEADS_LIMIT} leads — open Leads for the full table.
              </p>
            </div>
            {leads.length > 0 && onViewAllLeads && (
              <button
                type="button"
                onClick={onViewAllLeads}
                className="inline-flex shrink-0 items-center gap-1 rounded-btn border border-border px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-bg-deep hover:text-white"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <LeadsTable
              leads={recentLeads}
              compact
              emptyMessage="No leads yet — use Generate Lead to get started"
              onView={onViewLead}
            />
          </div>
        </section>
      </div>

      <QuadrantStats data={analytics.quadrant} />

      <MetricChain chain={analytics.chain} />

      <AlertsPanel items={analytics.actionItems} />
    </div>
  );
}
