'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, Sparkles } from 'lucide-react';
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
import { DASHBOARD_USER_NAME_STORAGE_KEY } from '@/lib/auth/display-name';
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
  Dashboard: 'Dashboard Overview',
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
  const [leadsPage, setLeadsPage] = useState(1);
  const [displayName, setDisplayName] = useState('EdFoal');

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
    const timer = window.setTimeout(() => {
      void loadLeads({ initial: true });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLeads]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedName = window.localStorage
        .getItem(DASHBOARD_USER_NAME_STORAGE_KEY)
        ?.trim();

      if (storedName) setDisplayName(storedName);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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

  const maxLeadsPage = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PAGE_SIZE));
  const currentLeadsPage = Math.min(leadsPage, maxLeadsPage);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setLeadsPage(1);
  }, []);

  const handleStatusChange = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
    setLeadsPage(1);
  }, []);

  const handleHealthChange = useCallback((value: HealthFilter) => {
    setHealthFilter(value);
    setLeadsPage(1);
  }, []);

  const paginatedLeads = useMemo(() => {
    const start = (currentLeadsPage - 1) * LEADS_PAGE_SIZE;
    return filteredLeads.slice(start, start + LEADS_PAGE_SIZE);
  }, [filteredLeads, currentLeadsPage]);

  const showLoadingSkeleton = loading && leads.length === 0;
  const displayKpi = kpi ?? computeKPI(leads);
  const emptyTableMessage =
    leads.length === 0
      ? 'No leads yet — use Generate Lead to get started'
      : undefined;

  return (
    <div className="mesh-bg flex min-h-screen">
      <Header activeNav={activeNav} displayName={displayName} onNavChange={setActiveNav} />

      <div className="min-w-0 flex-1">
        <main className="min-h-screen overflow-auto px-4 py-6 sm:px-6 lg:px-10">
          <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Welcome back, {displayName}
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                {PAGE_TITLE[activeNav]}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                {PAGE_SUBTITLE[activeNav] ??
                  'Premium sales automation, lead tracking, and revenue signals in one glass dashboard.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 text-slate-500 shadow-sm backdrop-blur-md sm:w-80">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search leads, projects..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
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
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => setGenerateLeadOpen(true)}
                >
                  Generate Lead
                </GlowButton>
              )}
            </div>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur">
              <p className="font-medium">Couldn&apos;t load leads</p>
              <p className="mt-1 text-red-600/80">{error}</p>
            </div>
          )}

          {showLoadingSkeleton ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-4xl border border-white/50 bg-white/55 backdrop-blur-xl"
                  />
                ))}
              </div>
              <div className="h-40 animate-pulse rounded-4xl border border-white/50 bg-white/55 backdrop-blur-xl" />
              <div className="h-64 animate-pulse rounded-4xl border border-white/50 bg-white/55 backdrop-blur-xl" />
            </div>
          ) : activeNav === 'Dashboard' ? (
            <DashboardView
              leads={leads}
              kpi={displayKpi}
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
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
                onHealthChange={handleHealthChange}
              />
              <LeadsTable
                leads={paginatedLeads}
                emptyMessage={emptyTableMessage}
                onView={setSelectedLead}
                pagination={{
                  page: currentLeadsPage,
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
          void loadLeads();
          void pollForNewLeads();
        }}
      />
    </div>
  );
}
