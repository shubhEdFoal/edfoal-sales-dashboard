'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RequestStatusBadge } from '@/components/dashboard/RequestStatusBadge';
import type { LeadGenerationRequest } from '@/lib/api/types';

function formatTimestamp(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-btn border border-border bg-bg-deep/40 p-3">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-sm text-slate-100">{children}</div>
    </div>
  );
}

interface LeadRequestDetailModalProps {
  requestId: string | null;
  onClose: () => void;
}

export function LeadRequestDetailModal({ requestId, onClose }: LeadRequestDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<LeadGenerationRequest | null>(null);

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setRequest(null);

    fetch(`/api/status/${encodeURIComponent(requestId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = (await res.json()) as {
          success?: boolean;
          request?: LeadGenerationRequest;
          error?: string;
        };
        if (!res.ok || !data.request) {
          throw new Error(data.error ?? 'Failed to load request details');
        }
        if (!cancelled) setRequest(data.request);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load request details');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [requestId, onClose]);

  if (!requestId) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="request-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="request-detail-panel"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-bg-surface shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-surface/95 px-6 py-4 backdrop-blur">
            <div>
              <h2 className="text-lg font-semibold text-white">Lead generation request</h2>
              <p className="mt-1 font-mono text-xs text-slate-500">{requestId}</p>
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
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
              </div>
            )}

            {error && (
              <div className="rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                {error}
              </div>
            )}

            {request && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <RequestStatusBadge status={request.status} isRunning={request.isRunning} />
                  <span className="rounded-full bg-bg-deep px-2.5 py-1 text-xs text-slate-300">
                    {request.inserted}/{request.numberOfLeads} inserted
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailField label="Query">{request.query || '—'}</DetailField>
                  <DetailField label="Business type">{request.businessType || '—'}</DetailField>
                  <DetailField label="Location">
                    {[request.state, request.country].filter(Boolean).join(', ') || '—'}
                  </DetailField>
                  <DetailField label="Email tone">{request.emailTone || '—'}</DetailField>
                  <DetailField label="Started">{formatTimestamp(request.startedAt)}</DetailField>
                  <DetailField label="Completed">{formatTimestamp(request.completedAt)}</DetailField>
                  <DetailField label="Created">{formatTimestamp(request.createdAt)}</DetailField>
                  <DetailField label="Request ID">
                    <span className="break-all font-mono text-xs">{request.requestID}</span>
                  </DetailField>
                </div>

                {request.error && (
                  <div className="rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                    {request.error}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
