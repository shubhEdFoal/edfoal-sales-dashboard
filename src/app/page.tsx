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
import { downloadLeadsCSV } from '@/lib/export-csv';
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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [generateLeadOpen, setGenerateLeadOpen] = useState(false);

  const handleDeleteLead = useCallback((lead: Lead) => {
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setSelectedLead((current) => (current?.id === lead.id ? null : current));
  }, []);

  const handleExportCSV = useCallback(() => {
    if (leads.length === 0) return;
    downloadLeadsCSV(leads);
  }, [leads]);

  const handleSaveLead = useCallback(
    async (lead: Lead): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || data.ok === false) {
          return { ok: false, error: data.error ?? 'Save failed.' };
        }
        setLeads((prev) => [lead, ...prev]);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Network error.',
        };
      }
    },
    []
  );

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/leads');
      const data = (await res.json()) as LeadsApiResponse;

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to load leads');
      }

      setLeads(data.leads);
      setKpi(data.kpi);
      setFunnel(data.funnel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
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
  const emptyTableMessage =
    leads.length === 0 ? 'No lead rows in your Google Sheet yet' : undefined;

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
                onClick={() => void loadLeads()}
              >
                Refresh
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
              <p className="font-medium">Couldn&apos;t load data from Google Sheets</p>
              <p className="mt-1 text-red-200/80">{error}</p>
              <p className="mt-2 text-xs text-red-200/60">
                Set `GOOGLE_SHEET_ID` in `.env.local` and share the sheet as &quot;Anyone with
                the link&quot; → Viewer.
              </p>
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
          ) : activeNav === 'Dashboard' && kpi ? (
            <div className="space-y-6">
              <KPISection kpi={kpi} />
              <PipelineFunnel stages={funnel} />

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
                  Sheet is connected. Add leads starting from row 2 and click Refresh.
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
        onGenerated={() => void loadLeads()}
      />
    </div>
  );
}
