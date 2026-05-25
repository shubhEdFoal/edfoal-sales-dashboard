'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import type { Lead } from '@/data/leads';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { cn } from '@/lib/utils';

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-btn border border-border bg-bg-deep/40 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-sm text-slate-100">{children}</div>
    </div>
  );
}

function formatTimestamp(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lead, onClose]);

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-surface/95 px-6 py-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent-blue/10">
                  <Building2 className="h-5 w-5 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {lead.businessName || 'Untitled lead'}
                  </h2>
                  <p className="font-mono text-xs text-slate-500">
                    ID: {lead.id} {lead.sentId && <>&middot; Sent {lead.sentId}</>}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:bg-bg-deep hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={lead.status} />
                <HealthBadge health={lead.campaignHealth} />
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs',
                    lead.shouldContinue
                      ? 'bg-accent-green/10 text-accent-green'
                      : 'bg-accent-red/10 text-accent-red'
                  )}
                >
                  {lead.shouldContinue ? 'Continue' : 'Do not continue'}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs',
                    lead.followUpDay > 3
                      ? 'bg-accent-amber/10 text-accent-amber'
                      : 'bg-bg-deep text-slate-300'
                  )}
                >
                  Day {lead.followUpDay}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={Mail} label="Email">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1 break-all text-accent-blue hover:underline"
                    >
                      {lead.email}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </Field>
                <Field icon={Phone} label="Phone">
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-slate-100 hover:text-accent-blue"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </Field>
                <Field icon={Globe} label="Website">
                  {lead.website ? (
                    <a
                      href={
                        lead.website.startsWith('http')
                          ? lead.website
                          : `https://${lead.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 break-all text-accent-blue hover:underline"
                    >
                      {lead.website}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </Field>
                <Field icon={MapPin} label="Address">
                  <span className="text-slate-200">{lead.address || '—'}</span>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={Send} label="Email style">
                  {lead.emailStyle}
                </Field>
                <Field label="Target segment">
                  {lead.targetSegment || '—'}
                </Field>
                <Field label="Responded">
                  <span
                    className={
                      lead.responded ? 'text-accent-green' : 'text-slate-400'
                    }
                  >
                    {lead.responded ? 'Yes' : 'No'}
                  </span>
                </Field>
                <Field label="Replied">
                  <span
                    className={
                      lead.replied ? 'text-accent-amber' : 'text-slate-400'
                    }
                  >
                    {lead.replied ? 'Yes' : 'No'}
                  </span>
                </Field>
                <Field icon={Calendar} label="Last activity">
                  <span className="text-slate-200">{formatTimestamp(lead.timestamp)}</span>
                </Field>
                <Field label="Follow-up day">
                  <span className="font-mono">Day {lead.followUpDay}</span>
                </Field>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 rounded-btn bg-accent-blue/10 px-3 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/20"
                  >
                    <Mail className="h-4 w-4" />
                    Send email
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-2 rounded-btn border border-border px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-bg-deep hover:text-white"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
