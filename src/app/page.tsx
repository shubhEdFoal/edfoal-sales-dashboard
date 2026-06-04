'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus, RefreshCw, Sparkles } from 'lucide-react';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { AddLeadModal } from '@/components/dashboard/AddLeadModal';
import { GenerateLeadModal } from '@/components/dashboard/GenerateLeadModal';
import {
  FilterBar,
  type HealthFilter,
  type StatusFilter,
} from '@/components/dashboard/FilterBar';
import { KPISection } from '@/components/dashboard/KPISection';
import { LeadDetailsModal } from '@/components/dashboard/LeadDetailsModal';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel';
import { Header, type NavLink } from '@/components/layout/Header';
import { GlowButton } from '@/components/ui/GlowButton';
import type { Lead } from '@/data/leads';
import { EDFOAL_LEADS_SHEET } from '@/config/edfoal-sheet';
import { downloadLeadsCSV } from '@/lib/export-csv';
import { computeFunnel, computeKPI } from '@/lib/sheets/kpi';
import type { FunnelStage, LeadKPI } from '@/lib/sheets/kpi';

interface LeadsApiResponse {
  leads: Lead[];
  kpi: LeadKPI;
  funnel: FunnelStage[];
  error?: string;
}

const PAGE_TITLE: Record<NavLink, string> = {
  Dashboard: 'Sales Automation',
  Leads: 'All Leads',
  Analytics: 'Predictive Analytics',
  Settings: 'Settings',
};

const PAGE_SUBTITLE: Partial<Record<NavLink, string>> = {
  Analytics:
    'Leading indicators, conversion ratios, and action items \u2014 all in one view.',
};

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavLink>('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpi, setKpi] = useState<LeadKPI | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [generateLeadOpen, setGenerateLeadOpen] = useState(false);

  const handleDeleteLead = useCallback(
    async (lead: Lead) => {
      try {
        const res = await fetch(`/api/leads?id=${encodeURIComponent(lead.id)}`, {
          method: 'DELETE',
        });
        const data = (await res.json()) as LeadsApiResponse;
        if (!res.ok) {
          throw new Error(data.error ?? 'Failed to delete lead');
        }
        setLeads(data.leads);
        setKpi(data.kpi);
        setFunnel(data.funnel);
        setSelectedLead((current) => (current?.id === lead.id ? null : current));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete lead');
      }
    },
    []
  );

  const handleExportCSV = useCallback(() => {
    if (leads.length === 0) return;
    downloadLeadsCSV(leads);
  }, [leads]);

  const applyLeadsResponse = useCallback((data: LeadsApiResponse) => {
    setLeads(data.leads);
    setKpi(data.kpi);
    setFunnel(data.funnel);
  }, []);

  const loadLeads = useCallback(
    async (syncFromSheet = false, options?: { initial?: boolean }) => {
      if (options?.initial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/leads?sync=${syncFromSheet ? '1' : '0'}&_=${Date.now()}`,
          { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }
        );
        const data = (await res.json()) as LeadsApiResponse;

        if (!res.ok) {
          throw new Error(data.error ?? 'Failed to load leads');
        }

        applyLeadsResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leads');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [applyLeadsResponse]
  );

  const pollForNewLeads = useCallback(async () => {
    const startCount = leads.length;
    const delays = [5000, 20000, 20000, 20000, 20000, 20000];
    for (const delay of delays) {
      await new Promise((r) => setTimeout(r, delay));
      try {
        const res = await fetch(`/api/leads?sync=1&_=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = (await res.json()) as LeadsApiResponse;
        if (res.ok) {
          applyLeadsResponse(data);
          if (data.leads.length > startCount) return;
        }
      } catch {
        // keep polling
      }
    }
  }, [applyLeadsResponse, leads.length]);

  const handleSaveLead = useCallback(
    async (lead: Lead): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        const data = (await res.json()) as LeadsApiResponse & {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok || data.ok === false) {
          return { ok: false, error: data.error ?? 'Save failed.' };
        }
        if (data.leads) {
          applyLeadsResponse(data);
        } else {
          await loadLeads(true);
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error.',
        };
      }
    },
    [applyLeadsResponse, loadLeads]
  );

  useEffect(() => {
    void loadLeads(true, { initial: true });
  }, [loadLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchTerm === '' ||
        lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesHealth =
        healthFilter === 'ALL' || lead.campaignHealth === healthFilter;

      return matchesSearch && matchesStatus && matchesHealth;
    });
  }, [leads, searchTerm, statusFilter, healthFilter]);

  const showLoadingSkeleton = loading && leads.length === 0;
  const displayKpi = kpi ?? computeKPI(leads);
  const displayFunnel = funnel.length > 0 ? funnel : computeFunnel(leads);
  const emptyTableMessage =
    leads.length === 0
      ? 'No leads yet — use Add Lead or Generate Lead to get started'
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="flex flex-1">
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{PAGE_TITLE[activeNav]}</h1>
              {PAGE_SUBTITLE[activeNav] && (
                <p className="mt-1 text-sm text-slate-400">{PAGE_SUBTITLE[activeNav]}</p>
              )}
            </div>
            <div className="flex gap-2">
              <GlowButton
                variant="ghost"
                icon={RefreshCw}
                onClick={() => void loadLeads(true)}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </GlowButton>
              {activeNav !== 'Settings' && (
                <GlowButton
                  variant="ghost"
                  icon={Download}
                  onClick={handleExportCSV}
                  disabled={leads.length === 0}
                >
                  Export CSV
                </GlowButton>
              )}
              {activeNav === 'Dashboard' && (
                <>
                  <GlowButton
                    variant="primary"
                    icon={Plus}
                    onClick={() => setAddLeadOpen(true)}
                  >
                    Add Lead
                  </GlowButton>
                  <GlowButton
                    variant="ghost"
                    icon={Sparkles}
                    onClick={() => setGenerateLeadOpen(true)}
                    className="border-accent-amber/40 text-accent-amber hover:bg-accent-amber/10 hover:text-accent-amber"
                  >
                    Generate Lead
                  </GlowButton>
                </>
              )}
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-card border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <p className="font-medium">Couldn&apos;t load leads</p>
              <p className="mt-1 text-red-200/80">{error}</p>
            </div>
          )}

          {showLoadingSkeleton ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-card border border-border bg-bg-surface"
                  />
                ))}
              </div>
              <div className="h-40 animate-pulse rounded-card border border-border bg-bg-surface" />
              <div className="h-64 animate-pulse rounded-card border border-border bg-bg-surface" />
            </div>
          ) : activeNav === 'Dashboard' ? (
            <div className="space-y-6">
              <KPISection kpi={displayKpi} />
              <PipelineFunnel stages={displayFunnel} />

              <FilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                healthFilter={healthFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onHealthChange={setHealthFilter}
              />

              {leads.length === 0 && (
                <div className="rounded-card border border-accent-amber/30 bg-accent-amber/10 px-4 py-3 text-sm text-accent-amber">
                  No leads in the platform yet. Add one manually, generate leads, or add rows
                  in the{' '}
                  <a
                    href={EDFOAL_LEADS_SHEET.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline hover:text-amber-200"
                  >
                    Google Sheet
                  </a>{' '}
                  and click Refresh.
                </div>
              )}

              <LeadsTable
                leads={filteredLeads}
                emptyMessage={emptyTableMessage}
                onView={setSelectedLead}
                onDelete={handleDeleteLead}
              />
            </div>
          ) : activeNav === 'Analytics' ? (
            <AnalyticsView leads={leads} />
          ) : activeNav === 'Leads' ? (
            <div className="space-y-6">
              <FilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                healthFilter={healthFilter}
                onSearchChange={setSearchTerm}
                onStatusChange={setStatusFilter}
                onHealthChange={setHealthFilter}
              />
              <LeadsTable
                leads={filteredLeads}
                emptyMessage={emptyTableMessage}
                onView={setSelectedLead}
                onDelete={handleDeleteLead}
              />
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border bg-bg-surface p-12 text-center">
              <p className="text-sm text-slate-400">Settings panel coming soon.</p>
            </div>
          )}
        </main>
      </div>

      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      <AddLeadModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        onSave={handleSaveLead}
      />
      <GenerateLeadModal
        open={generateLeadOpen}
        onClose={() => setGenerateLeadOpen(false)}
        onGenerated={() => {
          void loadLeads(true);
          void pollForNewLeads();
        }}
      />
    </div>
  );
}
