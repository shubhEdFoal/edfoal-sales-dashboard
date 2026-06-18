'use client';

import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Flame,
  MailCheck,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import type { Lead } from '@/data/leads';
import type { LeadKPI } from '@/lib/sheets/kpi';
import { cn } from '@/lib/utils';

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
  const projectRows = useMemo(
    () => [
      {
        title: 'Lead Discovery',
        subLabel: `${kpi.totalLeads} prospects sourced`,
        percent: kpi.totalLeads > 0 ? 92 : 18,
        icon: Users,
        color: 'from-orange-400 to-amber-500',
        glow: 'shadow-orange-400/40',
      },
      {
        title: 'Outreach Engine',
        subLabel: `${kpi.emailsSent} emails queued`,
        percent:
          kpi.totalLeads > 0
            ? Math.min(96, Math.round((kpi.emailsSent / kpi.totalLeads) * 100))
            : 0,
        icon: MailCheck,
        color: 'from-indigo-500 to-violet-500',
        glow: 'shadow-indigo-500/40',
      },
      {
        title: 'Meeting Pipeline',
        subLabel: `${kpi.meetingsBooked} meetings booked`,
        percent:
          kpi.totalLeads > 0
            ? Math.min(100, Math.round((kpi.meetingsBooked / kpi.totalLeads) * 100))
            : 0,
        icon: CalendarCheck,
        color: 'from-emerald-400 to-teal-500',
        glow: 'shadow-emerald-500/40',
      },
    ],
    [kpi]
  );

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
  const dayBars = [44, 58, 36, 72, 96, 54, 68];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <section className="widget-card p-6 xl:col-span-3">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
              Projects
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
              Project Tracker
            </h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-5">
          {projectRows.map((project) => (
            <div key={project.title} className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg',
                    project.color,
                    project.glow
                  )}
                >
                  <project.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{project.title}</p>
                  <p className="truncate text-xs text-slate-500">{project.subLabel}</p>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{project.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className={cn(
                    'h-full rounded-full bg-linear-to-r shadow-[0_0_16px_currentColor]',
                    project.color
                  )}
                  style={{ width: `${project.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="widget-card overflow-hidden xl:col-span-9">
        <div className="bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 px-8 py-9 text-white">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70">
                Featured workflow
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
                Sales agents are finding your next best accounts.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Launch lead discovery, monitor active jobs, and turn response signals into
                meetings without leaving the dashboard.
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
        <div className="grid gap-4 p-8 md:grid-cols-3">
          {[
            { label: 'Total Leads', value: kpi.totalLeads, icon: Users },
            { label: 'Responses', value: kpi.responses, icon: TrendingUp },
            { label: 'Meetings', value: kpi.meetingsBooked, icon: CalendarCheck },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white/55 p-4 backdrop-blur">
              <stat.icon className="mb-4 h-5 w-5 text-indigo-600" />
              <p className="text-3xl font-extrabold text-slate-950">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
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

      <section className="widget-card grid gap-8 p-8 xl:col-span-12 xl:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
            Earning Reports
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Financial signal report
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: 'Booked Meetings',
                value: kpi.meetingsBooked,
                icon: CalendarCheck,
                color: 'bg-indigo-100 text-indigo-600',
              },
              {
                label: 'Qualified Leads',
                value: kpi.qualified,
                icon: CircleDollarSign,
                color: 'bg-emerald-100 text-emerald-600',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] bg-white/55 p-5 backdrop-blur">
                <div
                  className={cn(
                    'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl',
                    item.color
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="text-4xl font-extrabold text-slate-950">{item.value}</p>
                <p className="mt-1 text-sm text-slate-500">{item.label}</p>
                <svg viewBox="0 0 120 34" className="mt-5 h-8 w-full text-indigo-500">
                  <path
                    d="M0 24 C20 4 34 30 52 14 S86 4 120 18"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-72 items-end justify-between gap-3 rounded-[1.75rem] bg-white/45 p-5 backdrop-blur">
          {dayBars.map((height, index) => {
            const active = index === 4;
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-56 items-end">
                  <div
                    className={cn(
                      'rounded-full transition-all duration-300',
                      active
                        ? 'w-10 bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.55)]'
                        : 'w-7 bg-indigo-100/40'
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-bold',
                    active ? 'text-indigo-600' : 'text-slate-400'
                  )}
                >
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="widget-card p-6 xl:col-span-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Recent Leads
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Latest Accounts</h2>
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {(recentLeads.length > 0 ? recentLeads : []).map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => onViewLead?.(lead)}
              className="rounded-3xl border border-white/60 bg-white/50 p-4 text-left backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/80 hover:shadow-xl hover:shadow-indigo-600/10"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Target className="h-5 w-5" />
              </div>
              <p className="truncate text-sm font-extrabold text-slate-900">{lead.businessName}</p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {lead.targetSegment || lead.email}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                <Flame className="h-3 w-3" />
                {lead.status.replaceAll('_', ' ')}
              </div>
            </button>
          ))}
          {recentLeads.length === 0 && (
            <div className="rounded-3xl border border-dashed border-indigo-200 bg-white/45 p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-5">
              No leads yet. Generate a lead to populate the premium account cards.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
