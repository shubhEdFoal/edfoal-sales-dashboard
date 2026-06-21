'use client';

import { CalendarCheck, MailCheck, TrendingUp, Users } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import type { LeadKPI } from '@/lib/sheets/kpi';

interface KPISectionProps {
  kpi: LeadKPI;
}

export function KPISection({ kpi }: KPISectionProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <KPICard
        label="Total Leads Scraped"
        value={kpi.totalLeads}
        icon={Users}
        color="blue"
        index={0}
      />
      <KPICard
        label="Emails Sent"
        value={kpi.emailsSent}
        icon={MailCheck}
        color="green"
        index={1}
      />
      <KPICard
        label="Reply Rate"
        value={`${kpi.responseRate}%`}
        icon={TrendingUp}
        color="amber"
        index={2}
      />
      <KPICard
        label="Meeting Booked"
        value={kpi.meetingsBooked}
        icon={CalendarCheck}
        color="green"
        index={3}
      />
    </section>
  );
}
