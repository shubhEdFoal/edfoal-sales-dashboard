'use client';

import {
  ArrowRight,
  CalendarCheck,
  MailCheck,
  Play,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { LeadRequestStatusPanel } from '@/components/dashboard/LeadRequestStatusPanel';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import type { Lead } from '@/data/leads';
import type { LeadKPI } from '@/lib/sheets/kpi';

const RECENT_LEADS_LIMIT = 5;

interface DashboardViewProps {
  leads: Lead[];
  kpi: LeadKPI;
  onViewLead?: (lead: Lead) => void;
  onViewAllLeads?: () => void;
}

export function DashboardView({
  leads,
  kpi,
  onViewLead,
  onViewAllLeads,
}: DashboardViewProps) {
  const recentLeads = useMemo(() => leads.slice(0, RECENT_LEADS_LIMIT), [leads]);

  const horizontalBars = [
    {
      label: 'Sent',
      value: kpi.emailsSent,
      percent: kpi.totalLeads ? (kpi.emailsSent / kpi.totalLeads) * 100 : 0,
    },
    { label: 'Replies', value: kpi.responses, percent: kpi.responseRate },
    {
      label: 'Qualified',
      value: kpi.qualified,
      percent: kpi.totalLeads ? (kpi.qualified / kpi.totalLeads) * 100 : 0,
    },
  ];
  const revenueScore = 78;
  const circumference = 2 * Math.PI * 46;
  const gaugeOffset = circumference * (1 - revenueScore / 100);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section className="widget-card overflow-hidden xl:col-span-12">
        <div className="bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 px-8 py-9 text-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
                Lead generation workflow
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
                Generate targeted leads and track every opportunity in one place.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Start a lead search, monitor generation progress, review qualified prospects,
                and follow up faster from a single dashboard.
              </p>
            </div>
            <button
              type="button"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white shadow-2xl backdrop-blur transition-transform hover:scale-105"
              aria-label="Play dashboard overview"
            >
              <Play className="ml-1 h-8 w-8 fill-current" />
            </button>
          </div>
        </div>
        <div className="grid gap-4 p-8 md:grid-cols-4">
          {[
            { label: 'Total Leads Scraped', value: kpi.totalLeads, icon: Users },
            { label: 'Emails Sent', value: kpi.emailsSent, icon: MailCheck },
            { label: 'Reply Rate', value: `${kpi.responseRate}%`, icon: TrendingUp },
            { label: 'Meeting Booked', value: kpi.meetingsBooked, icon: CalendarCheck },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white/55 p-4 backdrop-blur">
              <stat.icon className="mb-4 h-5 w-5 text-indigo-600" />
              <p className="text-3xl font-extrabold text-slate-950">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <LeadRequestStatusPanel className="xl:col-span-5" />

      <section className="widget-card overflow-hidden xl:col-span-7">
        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Recent Leads
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Latest Leads</h2>
          </div>
          {leads.length > 0 && onViewAllLeads && (
            <button
              type="button"
              onClick={onViewAllLeads}
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <LeadsTable
          leads={recentLeads}
          compact
          embedded
          emptyMessage="No recent leads yet"
          onView={onViewLead}
        />
      </section>

      <section className="widget-card p-6 xl:col-span-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Conversion Mix
        </p>
        <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Pipeline Bars</h3>
        <div className="mt-7 space-y-5">
          {horizontalBars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">{bar.label}</span>
                <span className="font-mono text-xs text-slate-500">{bar.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-indigo-100/50">
                <div
                  className="h-full rounded-full bg-indigo-600 shadow-[0_0_18px_rgba(79,70,229,0.45)]"
                  style={{ width: `${Math.max(8, Math.min(100, bar.percent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="widget-card overflow-hidden p-6 xl:col-span-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
              Response Trend
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Smooth Curve</h3>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-500">
            {kpi.responseRate}%
          </span>
        </div>
        <div className="relative -mx-6 mt-8 h-40">
          <div className="absolute inset-x-8 top-10 h-20 rounded-full bg-rose-400/25 blur-2xl" />
          <svg
            viewBox="0 0 100 80"
            preserveAspectRatio="none"
            className="relative h-full w-full"
          >
            <defs>
              <linearGradient id="response-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,30 C20,10 40,50 60,20 S80,10 100,30 L100,80 L0,80 Z"
              fill="url(#response-gradient)"
            />
            <path
              d="M0,30 C20,10 40,50 60,20 S80,10 100,30"
              fill="none"
              stroke="#f43f5e"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>
        </div>
      </section>

      <section className="widget-card flex flex-col items-center justify-between p-6 text-center xl:col-span-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
            Goal Gauge
          </p>
          <h3 className="mt-1 text-2xl font-extrabold text-slate-950">Revenue Readiness</h3>
        </div>
        <div className="relative my-7 h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="rgba(251,191,36,0.18)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#f59e0b"
              strokeDasharray={circumference}
              strokeDashoffset={gaugeOffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-slate-950">{revenueScore}%</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
          </div>
        </div>
        <p className="max-w-xs text-sm text-slate-500">
          Healthy lead volume with strong room to lift booked-meeting conversion.
        </p>
      </section>

    </div>
  );
}
