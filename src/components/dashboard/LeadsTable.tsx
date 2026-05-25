'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Eye, Mail, SearchX, Trash2 } from 'lucide-react';
import type { Lead } from '@/data/leads';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: Lead[];
  emptyMessage?: string;
  onView?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

export function LeadsTable({ leads, emptyMessage, onView, onDelete }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border bg-bg-surface py-16">
        <SearchX className="mb-4 h-12 w-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-400">
          {emptyMessage ?? 'No leads match your filters'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {emptyMessage
            ? 'Add data to your sheet and click Refresh'
            : 'Try adjusting your search or filter criteria'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-bg-deep text-left">
            {[
              'BUSINESS',
              'EMAIL',
              'STATUS',
              'HEALTH',
              'EMAIL STYLE',
              'FOLLOW-UP DAY',
              'ACTIONS',
            ].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-xs font-medium tracking-widest text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <motion.tr
              key={lead.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className="border-t border-border transition-colors hover:bg-bg-surface/30"
            >
              <td className="px-4 py-4">
                <p className="font-semibold text-white">{lead.businessName}</p>
                <p className="font-mono text-xs text-slate-500">{lead.sentId}</p>
              </td>
              <td className="px-4 py-4">
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1 font-mono text-xs text-slate-300 hover:text-accent-blue"
                >
                  {lead.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </td>
              <td className="px-4 py-4">
                <StatusPill status={lead.status} />
              </td>
              <td className="px-4 py-4">
                <HealthBadge health={lead.campaignHealth} />
              </td>
              <td className="px-4 py-4">
                <span className="rounded-full bg-bg-deep px-2.5 py-1 text-xs text-slate-300">
                  {lead.emailStyle}
                </span>
              </td>
              <td className="px-4 py-4">
                <span
                  className={cn(
                    'font-mono text-sm font-medium',
                    lead.followUpDay > 3 ? 'text-accent-amber' : 'text-accent-green'
                  )}
                >
                  Day {lead.followUpDay}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="View details"
                    title="View details"
                    onClick={() => onView?.(lead)}
                    className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:border-accent-blue/40 hover:bg-accent-blue/10 hover:text-accent-blue active:scale-95"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      aria-label={`Send email to ${lead.email}`}
                      title={`Send email to ${lead.email}`}
                      className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:border-accent-blue/40 hover:bg-accent-blue/10 hover:text-accent-blue active:scale-95"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-label="No email available"
                      title="No email available"
                      className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-btn border border-border text-slate-700"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Delete from table"
                    title="Delete from table"
                    onClick={() => onDelete?.(lead)}
                    className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:border-accent-red/40 hover:bg-accent-red/10 hover:text-accent-red active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
