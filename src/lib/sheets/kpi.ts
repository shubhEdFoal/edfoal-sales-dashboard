import type { Lead } from '@/data/leads';

export interface LeadKPI {
  totalLeads: number;
  emailsSent: number;
  responses: number;
  meetingsBooked: number;
  qualified: number;
  responseRate: number;
}

export function computeKPI(leads: Lead[]): LeadKPI {
  const totalLeads = leads.length;
  const emailsSent = leads.filter((l) => isSent(l.mailStatus)).length;
  const responses = leads.filter((l) => isYes(l.repliedByUs)).length;
  const meetingsBooked = leads.filter((l) => isYes(l.schedulingSent)).length;
  const qualified = leads.filter((l) => l.status === 'QUALIFIED').length;
  const responseRate =
    emailsSent > 0 ? Math.round((responses / emailsSent) * 100) : 0;

  return {
    totalLeads,
    emailsSent,
    responses,
    meetingsBooked,
    qualified,
    responseRate,
  };
}

function isSent(value: string | null | undefined) {
  return value?.trim().toLowerCase() === 'sent';
}

function isYes(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
}

export interface FunnelStage {
  label: string;
  count: number;
  color: string;
  width: string;
}

export function computeFunnel(leads: Lead[]): FunnelStage[] {
  const total = leads.length;
  const divisor = total > 0 ? total : 1;
  const enriched = leads.filter((l) => l.email.trim() !== '').length;
  const outreachSent = leads.filter((l) => l.sentId.trim() !== '' || l.status !== 'QUALIFIED').length;
  const responded = leads.filter((l) => l.responded).length;
  const meetingsBooked = leads.filter((l) => l.status === 'MEETING_BOOKED').length;

  const pct = (n: number) => `${total === 0 ? 0 : Math.max((n / divisor) * 100, n > 0 ? 8 : 0)}%`;

  return [
    { label: 'Lead Discovery', count: total, color: 'bg-slate-500', width: total > 0 ? '100%' : '0%' },
    { label: 'Enriched', count: enriched, color: 'bg-slate-400', width: pct(enriched) },
    { label: 'Outreach Sent', count: outreachSent, color: 'bg-accent-blue', width: pct(outreachSent) },
    { label: 'Responded', count: responded, color: 'bg-accent-amber', width: pct(responded) },
    {
      label: 'Meeting Booked',
      count: meetingsBooked,
      color: 'bg-accent-green',
      width: pct(meetingsBooked),
    },
  ];
}
