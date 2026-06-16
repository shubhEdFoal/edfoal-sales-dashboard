'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Eye, SearchX } from 'lucide-react';
import type { Lead } from '@/data/leads';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { TablePagination } from '@/components/ui/TablePagination';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: Lead[];
  emptyMessage?: string;
  compact?: boolean;
  onView?: (lead: Lead) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

function CellText({ value, mono = false }: { value: string | null | undefined; mono?: boolean }) {
  const text = value?.trim();
  if (!text) return <span className="text-slate-600">—</span>;
  return (
    <span className={cn('text-sm text-slate-200', mono && 'font-mono text-xs')}>{text}</span>
  );
}

function CellLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-[220px] items-center gap-1 truncate text-xs text-accent-blue hover:underline"
      title={label}
    >
      <span className="truncate">{label}</span>
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

type ColumnDef = {
  key: string;
  label: string;
  minWidth?: string;
  render: (lead: Lead) => React.ReactNode;
};

const TABLE_COLUMNS: ColumnDef[] = [
  {
    key: 'id',
    label: 'ID',
    minWidth: '72px',
    render: (lead) => <CellText value={lead.id} mono />,
  },
  {
    key: 'businessName',
    label: 'BUSINESS',
    minWidth: '200px',
    render: (lead) => (
      <span className="block max-w-[240px] truncate text-sm font-semibold text-white">
        {lead.businessName}
      </span>
    ),
  },
  {
    key: 'email',
    label: 'EMAIL',
    minWidth: '180px',
    render: (lead) => {
      const emails = (lead.allEmails ?? []).filter((e) => e.includes('@'));
      const primary = lead.email || emails[0];
      if (!primary) return <CellText value={null} />;
      return (
        <a
          href={`mailto:${primary}`}
          className="inline-flex max-w-[220px] items-center gap-1 truncate font-mono text-xs text-slate-300 hover:text-accent-blue"
        >
          {emails.length > 1 ? `${primary} (+${emails.length - 1})` : primary}
        </a>
      );
    },
  },
  {
    key: 'phone',
    label: 'PHONE',
    minWidth: '140px',
    render: (lead) => <CellText value={lead.phone} />,
  },
  {
    key: 'website',
    label: 'WEBSITE',
    minWidth: '160px',
    render: (lead) =>
      lead.website ? (
        <CellLink
          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
          label={lead.website}
        />
      ) : (
        <CellText value={null} />
      ),
  },
  {
    key: 'address',
    label: 'ADDRESS',
    minWidth: '220px',
    render: (lead) => (
      <span className="block max-w-[260px] truncate text-sm text-slate-200">
        {lead.address || '—'}
      </span>
    ),
  },
  {
    key: 'rating',
    label: 'RATING',
    minWidth: '80px',
    render: (lead) => <CellText value={lead.rating} />,
  },
  {
    key: 'businessType',
    label: 'BUSINESS TYPE',
    minWidth: '140px',
    render: (lead) => <CellText value={lead.targetSegment} />,
  },
  {
    key: 'state',
    label: 'STATE',
    minWidth: '100px',
    render: (lead) => <CellText value={lead.state} />,
  },
  {
    key: 'country',
    label: 'COUNTRY',
    minWidth: '100px',
    render: (lead) => <CellText value={lead.country} />,
  },
  {
    key: 'emailTone',
    label: 'EMAIL TONE',
    minWidth: '120px',
    render: (lead) => (
      <span className="rounded-full bg-bg-deep px-2.5 py-1 text-xs text-slate-300">
        {lead.emailStyle}
      </span>
    ),
  },
  {
    key: 'sentId',
    label: 'SENT ID',
    minWidth: '140px',
    render: (lead) => <CellText value={lead.sentId} mono />,
  },
  {
    key: 'mailStatus',
    label: 'MAIL STATUS',
    minWidth: '110px',
    render: (lead) => <CellText value={lead.mailStatus} />,
  },
  {
    key: 'response',
    label: 'RESPONSE',
    minWidth: '120px',
    render: (lead) => <CellText value={lead.response} />,
  },
  {
    key: 'repliedByUs',
    label: 'REPLIED BY US',
    minWidth: '120px',
    render: (lead) => <CellText value={lead.repliedByUs} />,
  },
  {
    key: 'health',
    label: 'HEALTH',
    minWidth: '100px',
    render: (lead) => <HealthBadge health={lead.campaignHealth} />,
  },
  {
    key: 'reEngagementSent',
    label: 'RE-ENGAGEMENT',
    minWidth: '120px',
    render: (lead) => <CellText value={lead.reEngagementSent} />,
  },
  {
    key: 'schedulingSent',
    label: 'SCHEDULING',
    minWidth: '110px',
    render: (lead) => <CellText value={lead.schedulingSent} />,
  },
  {
    key: 'status',
    label: 'STATUS',
    minWidth: '130px',
    render: (lead) => <StatusPill status={lead.status} />,
  },
  {
    key: 'requestID',
    label: 'REQUEST ID',
    minWidth: '180px',
    render: (lead) => (
      <span className="block max-w-[200px] truncate font-mono text-xs text-slate-400">
        {lead.requestID || '—'}
      </span>
    ),
  },
  {
    key: 'scrapedAt',
    label: 'SCRAPED AT',
    minWidth: '160px',
    render: (lead) => (
      <span className="whitespace-nowrap text-xs text-slate-300">
        {formatDate(lead.timestamp)}
      </span>
    ),
  },
  {
    key: 'linkedin',
    label: 'LINKEDIN',
    minWidth: '100px',
    render: (lead) =>
      lead.linkedinSearch ? (
        <CellLink href={lead.linkedinSearch} label="Search" />
      ) : (
        <CellText value={null} />
      ),
  },
  {
    key: 'maps',
    label: 'MAPS',
    minWidth: '90px',
    render: (lead) =>
      lead.mapsUrl ? <CellLink href={lead.mapsUrl} label="Open" /> : <CellText value={null} />,
  },
];

export function LeadsTable({
  leads,
  emptyMessage,
  compact = false,
  onView,
  pagination,
}: LeadsTableProps) {
  const columns: ColumnDef[] = [
    ...TABLE_COLUMNS,
    {
      key: 'actions',
      label: 'ACTIONS',
      minWidth: '72px',
      render: (lead) => (
        <button
          type="button"
          aria-label="View details"
          title="View details"
          onClick={() => onView?.(lead)}
          className={cn(
            'flex items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:border-accent-blue/40 hover:bg-accent-blue/10 hover:text-accent-blue active:scale-95',
            compact ? 'h-7 w-7' : 'h-8 w-8'
          )}
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border bg-bg-surface py-16">
        <SearchX className="mb-4 h-12 w-12 text-slate-600" />
        <p className="text-lg font-medium text-slate-400">
          {emptyMessage ?? 'No leads match your filters'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {emptyMessage
            ? 'Generate leads to populate the table'
            : 'Try adjusting your search or filter criteria'}
        </p>
      </div>
    );
  }

  const cellPad = compact ? 'px-3 py-2.5' : 'px-4 py-3';

  return (
    <div className="rounded-card border border-border bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <tr className="bg-bg-deep text-left">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ minWidth: col.minWidth }}
                  className={cn(
                    'whitespace-nowrap text-xs font-medium tracking-widest text-slate-400',
                    compact ? 'px-3 py-2' : 'px-4 py-3'
                  )}
                >
                  {col.label}
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
                {columns.map((col) => (
                  <td key={col.key} className={cn(cellPad, 'align-middle')}>
                    {col.render(lead)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
