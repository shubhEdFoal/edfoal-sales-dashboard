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
    <div className="rounded-2xl border border-white/60 bg-white/55 p-3 shadow-sm backdrop-blur">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-sm text-slate-700">{children}</div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-4xl border border-white/60 bg-white/75 shadow-2xl shadow-indigo-600/10 backdrop-blur-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/60 bg-white/80 px-6 py-4 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">
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
                className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/60 bg-white/55 text-slate-500 transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600"
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
                      ? 'border border-emerald-200 bg-emerald-50/80 text-emerald-600'
                      : 'border border-rose-200 bg-rose-50/80 text-rose-600'
                  )}
                >
                  {lead.shouldContinue ? 'Continue' : 'Do not continue'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={Mail} label="Email">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1 break-all font-semibold text-indigo-600 hover:underline"
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
                      className="text-slate-700 hover:text-indigo-600"
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
                      className="inline-flex items-center gap-1 break-all font-semibold text-indigo-600 hover:underline"
                    >
                      {lead.website}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </Field>
                <Field icon={MapPin} label="Address">
                  <span className="text-slate-700">{lead.address || '—'}</span>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={Send} label="Email style">
                  {lead.emailStyle}
                </Field>
                <Field label="Target segment">
                  {lead.targetSegment || '—'}
                </Field>
                <Field label="Mail status">
                  {lead.mailStatus || '—'}
                </Field>
                <Field label="Response">
                  {lead.response || (lead.responded ? 'Yes' : 'No')}
                </Field>
                <Field label="Replied by us">
                  {lead.repliedByUs || (lead.replied ? 'Yes' : 'No')}
                </Field>
                <Field label="Re-engagement sent">
                  {lead.reEngagementSent || '—'}
                </Field>
                <Field label="Scheduling sent">
                  {lead.schedulingSent || '—'}
                </Field>
                <Field label="Location">
                  {[lead.state, lead.country].filter(Boolean).join(', ') || '—'}
                </Field>
                <Field icon={Calendar} label="Last activity">
                  <span className="text-slate-700">{formatTimestamp(lead.timestamp)}</span>
                </Field>
                {lead.requestID && (
                  <Field label="Request ID">
                    <span className="break-all font-mono text-xs">{lead.requestID}</span>
                  </Field>
                )}
              </div>

              {lead.allEmails && lead.allEmails.length > 1 && (
                <Field icon={Mail} label="All emails">
                  <ul className="space-y-1">
                    {lead.allEmails.filter((e) => e.includes('@')).map((email) => (
                      <li key={email}>
                        <a
                          href={`mailto:${email}`}
                          className="break-all font-semibold text-indigo-600 hover:underline"
                        >
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Field>
              )}

              <div className="flex flex-wrap gap-2 border-t border-white/60 pt-4">
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    <Mail className="h-4 w-4" />
                    Send email
                  </a>
                )}
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/80 hover:text-indigo-600"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {lead.mapsUrl && (
                  <a
                    href={lead.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/55 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/80 hover:text-indigo-600"
                  >
                    <MapPin className="h-4 w-4" />
                    Maps
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
