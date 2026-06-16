'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Sparkles } from 'lucide-react';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { GenerateLeadModal } from '@/components/dashboard/GenerateLeadModal';
import {
  FilterBar,
  type HealthFilter,
  type StatusFilter,
} from '@/components/dashboard/FilterBar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { LeadDetailsModal } from '@/components/dashboard/LeadDetailsModal';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { Header, type NavLink } from '@/components/layout/Header';
import { GlowButton } from '@/components/ui/GlowButton';
import type { Lead } from '@/data/leads';
import { downloadLeadsCSV } from '@/lib/export-csv';
import { computeKPI } from '@/lib/sheets/kpi';
import type { LeadKPI } from '@/lib/sheets/kpi';

const LEADS_PAGE_SIZE = 10;

interface LeadsApiResponse {
  leads: Lead[];
  kpi: LeadKPI;
  error?: string;
}

const PAGE_TITLE: Record<NavLink, string> = {
  Dashboard: 'Sales Automation',
  Leads: 'All Leads',
  Analytics: 'Predictive Analytics',
};

const PAGE_SUBTITLE: Partial<Record<NavLink, string>> = {
  Analytics:
    'Leading indicators, conversion ratios, and action items \u2014 all in one view.',
};

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavLink>('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [kpi, setKpi] = useState<LeadKPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [generateLeadOpen, setGenerateLeadOpen] = useState(false);
  const [statusRefreshKey, setStatusRefreshKey] = useState(0);
  const [leadsPage, setLeadsPage] = useState(1);

  const applyLeadsResponse = useCallback((data: LeadsApiResponse) => {
    setLeads(data.leads);
    setKpi(data.kpi);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (leads.length === 0) return;
    downloadLeadsCSV(leads);
  }, [leads]);

  const loadLeads = useCallback(
    async (options?: { initial?: boolean }) => {
      if (options?.initial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const res = await fetch(`/api/leads?_=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
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
        const res = await fetch(`/api/leads?_=${Date.now()}`, {
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

  useEffect(() => {
    void loadLeads({ initial: true });
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

  useEffect(() => {
    setLeadsPage(1);
  }, [searchTerm, statusFilter, healthFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE));
    if (leadsPage > maxPage) setLeadsPage(maxPage);
  }, [filteredLeads.length, leadsPage]);

  const paginatedLeads = useMemo(() => {
    const start = (leadsPage - 1) * LEADS_PAGE_SIZE;
    return filteredLeads.slice(start, start + LEADS_PAGE_SIZE);
  }, [filteredLeads, leadsPage]);

  const showLoadingSkeleton = loading && leads.length === 0;
  const displayKpi = kpi ?? computeKPI(leads);
  const emptyTableMessage =
    leads.length === 0
      ? 'No leads yet — use Generate Lead to get started'
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
                onClick={() => void loadLeads()}
                disabled={refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </GlowButton>
              <GlowButton
                variant="ghost"
                icon={Download}
                onClick={handleExportCSV}
                disabled={leads.length === 0}
              >
                Export CSV
              </GlowButton>
              {activeNav === 'Dashboard' && (
                <GlowButton
                  variant="ghost"
                  icon={Sparkles}
                  onClick={() => setGenerateLeadOpen(true)}
                  className="border-accent-amber/40 text-accent-amber hover:bg-accent-amber/10 hover:text-accent-amber"
                >
                  Generate Lead
                </GlowButton>
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
            <DashboardView
              leads={leads}
              kpi={displayKpi}
              statusRefreshKey={statusRefreshKey}
              onViewLead={setSelectedLead}
              onViewAllLeads={() => setActiveNav('Leads')}
            />
          ) : activeNav === 'Analytics' ? (
            <AnalyticsView leads={leads} />
          ) : (
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
                leads={paginatedLeads}
                emptyMessage={emptyTableMessage}
                onView={setSelectedLead}
                pagination={{
                  page: leadsPage,
                  pageSize: LEADS_PAGE_SIZE,
                  total: filteredLeads.length,
                  onPageChange: setLeadsPage,
                }}
              />
            </div>
          )}
        </main>
      </div>

      <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      <GenerateLeadModal
        open={generateLeadOpen}
        onClose={() => setGenerateLeadOpen(false)}
        onGenerated={() => {
          setStatusRefreshKey((key) => key + 1);
          void loadLeads();
          void pollForNewLeads();
        }}
      />
    </div>
  );
}
